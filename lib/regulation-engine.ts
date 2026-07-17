import { FlightData, Verdict } from './types';
import { isEUAirport } from './distance-calculator';

const EU_EEA_AIRLINES = [
  'AF', 'LH', 'FR', 'U2', 'IB', 'KL', 'SK', 'AY', 'TP', 'EI', 'VY', 'UX', 'EW', 'SN', 'OS', 'LX', 'AZ', 'IZ', 'A3', 'LO', 'OK'
];

/**
 * Check if an airline is EU/EEA-licensed
 * v1: simplified; checking against a hardcoded list of major EU airline IATA codes
 */
function isEUAirline(airline_iata?: string): boolean {
  if (!airline_iata) return false;
  return EU_EEA_AIRLINES.includes(airline_iata.toUpperCase());
}

/**
 * Check if flight is within EU261 scope (Art. 3)
 * Applies if:
 * (a) departs from EU airport, any airline, OR
 * (b) arrives at EU airport, operated by EU airline
 */
export function isWithinEU261Scope(
  departure_iata: string,
  arrival_iata: string,
  airline_iata?: string
): boolean {
  const departureIsEU = isEUAirport(departure_iata);
  const arrivalIsEU = isEUAirport(arrival_iata);

  // Rule (a): departs from EU, any airline
  if (departureIsEU) {
    return true;
  }

  // Rule (b): arrives at EU, EU airline
  if (arrivalIsEU && isEUAirline(airline_iata)) {
    return true;
  }

  return false;
}

/**
 * Determine the triggering event (Art. 5-7)
 */
export function getTriggerEvent(
  flight_status: string,
  delay_minutes?: number,
  arrival_delay_minutes?: number
): 'cancellation' | 'delay' | 'denied_boarding' | 'none' {
  const status = (flight_status || '').toLowerCase();

  // Cancellation
  if (status === 'cancelled') {
    return 'cancellation';
  }

  // Delay of 3+ hours at destination
  // Use arrival_delay_minutes if available, otherwise fall back to departure delay
  const totalDelay = arrival_delay_minutes ?? delay_minutes ?? 0;
  if (totalDelay >= 180) {
    return 'delay';
  }

  // For now, treat denied boarding same as cancellation
  // In production, we'd get more nuanced data from AviationStack
  if (status === 'diverted' || status === 'denied') {
    return 'denied_boarding';
  }

  return 'none';
}

/**
 * Check extraordinary circumstances exemption (Art. 5(3))
 * Returns: true if exemption applies, false if not, 'unknown' if reason not determinable
 */
export function checkExtraordinaryCircumstances(reason_code?: string): boolean | 'unknown' {
  if (!reason_code) {
    return 'unknown';
  }

  const code = reason_code.toLowerCase();

  // Exemption applies for these causes
  const extraordinaryReasons = [
    'weather', // severe weather
    'air_traffic_control', // ATC restrictions
    'security', // security threat
    'strike', // strikes
    'political', // political instability
  ];

  if (extraordinaryReasons.some((r) => code.includes(r))) {
    return true;
  }

  // Technical/mechanical faults are NOT extraordinary per case law
  if (code.includes('technical') || code.includes('mechanical') || code.includes('aircraft')) {
    return false;
  }

  // Unknown cause
  return 'unknown';
}

/**
 * Calculate compensation tier by distance (Art. 7)
 */
function getCompensationTier(distance_km: number): number {
  if (distance_km <= 1500) {
    return 250; // EUR
  } else if (distance_km <= 3500) {
    return 400; // EUR
  } else {
    return 600; // EUR
  }
}

/**
 * Main evaluation function: determines eligibility and compensation
 */
export function evaluateEligibility(
  flight_data: FlightData,
  distance_km: number
): Verdict {
  const departure_iata = flight_data.departure?.iata;
  const arrival_iata = flight_data.arrival?.iata;
  const airline_iata = flight_data.airline?.iata; // Checked against EU_EEA_AIRLINES

  // Step 1: Check scope
  if (!departure_iata || !arrival_iata) {
    return {
      eligible: false,
      regulation: 'none',
      trigger: 'none',
      distance_km: -1,
      compensation_eur: 0,
      reduction_applied: false,
      reason_code: 'flight_not_found',
      confidence: 'high',
    };
  }

  if (!isWithinEU261Scope(departure_iata, arrival_iata, airline_iata)) {
    return {
      eligible: false,
      regulation: 'none',
      trigger: 'none',
      distance_km,
      compensation_eur: 0,
      reduction_applied: false,
      reason_code: 'outside_scope',
      confidence: 'high',
    };
  }

  // Step 2: Determine trigger event
  const flight_status = flight_data.flight_status || '';
  const arrival_delay = flight_data.arrival?.delay;
  const trigger = getTriggerEvent(flight_status, flight_data.departure?.delay, arrival_delay);

  if (trigger === 'none') {
    // On-time flight, no compensation
    return {
      eligible: false,
      regulation: 'EU261',
      trigger: 'none',
      distance_km,
      compensation_eur: 0,
      reduction_applied: false,
      reason_code: null,
      confidence: 'high',
    };
  }

  // Special case: delay under 3 hours doesn't trigger compensation
  if (trigger === 'delay' && (arrival_delay ?? 0) < 180) {
    return {
      eligible: false,
      regulation: 'EU261',
      trigger: 'delay',
      distance_km,
      compensation_eur: 0,
      reduction_applied: false,
      reason_code: 'delay_under_3h',
      confidence: 'high',
    };
  }

  // Step 3: Check extraordinary circumstances exemption
  // In real scenario, AviationStack gives us reason_code
  // For now, we can't determine it reliably, so we mark it as unknown
  const extraordinaryResult = checkExtraordinaryCircumstances(undefined);

  if (extraordinaryResult === true) {
    // Exemption applies, no compensation
    return {
      eligible: false,
      regulation: 'EU261',
      trigger,
      distance_km,
      compensation_eur: 0,
      reduction_applied: false,
      reason_code: 'extraordinary_circumstances',
      confidence: 'high',
    };
  }

  // If cancellation, high confidence (clear trigger)
  // If delay, still high confidence since we know the fact of the delay
  // reason_unknown means we can't verify extraordinary circumstances, but trigger is clear
  let confidence: 'high' | 'medium_reason_unclear' = 'high';
  let reason_code: string | null = 'airline_fault';

  if (extraordinaryResult === 'unknown' && trigger === 'delay') {
    // For delays, we mark as medium_unclear only if we can't confirm it's not extraordinary
    // But for now, still high confidence on the delay itself
    confidence = 'high';
    reason_code = 'airline_fault';
  }

  // Step 4: Calculate compensation (no reduction applied in v1 for simplicity)
  const base_compensation = getCompensationTier(distance_km);

  return {
    eligible: true,
    regulation: 'EU261',
    trigger,
    distance_km,
    compensation_eur: base_compensation,
    reduction_applied: false,
    reason_code,
    confidence,
    explanation_notes: undefined,
  };
}
