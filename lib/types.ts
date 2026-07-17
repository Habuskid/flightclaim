/**
 * Flight data from AviationStack API
 */
export interface FlightData {
  flight?: {
    number?: string;
    iata?: string;
    icao?: string;
    codeshared?: any;
  };
  flight_status: 'scheduled' | 'active' | 'landed' | 'cancelled' | 'delayed' | string;
  departure: {
    iata: string;
    icao?: string;
    terminal?: string;
    gate?: string;
    delay?: number;
    scheduled: string; // ISO 8601
    actual?: string; // ISO 8601
    estimated?: string; // ISO 8601
  };
  arrival: {
    iata: string;
    icao?: string;
    terminal?: string;
    gate?: string;
    baggage?: string;
    delay?: number;
    scheduled: string; // ISO 8601
    actual?: string; // ISO 8601
    estimated?: string; // ISO 8601
  };
  aircraft?: {
    registration?: string;
    iata?: string;
    icao?: string;
    icao24?: string;
  };
  airline: {
    name: string;
    iata?: string;
    icao?: string;
  };
}

/**
 * Verdict output from regulation engine
 * This is the immutable decision structure that Cysic will only explain, never alter
 */
export interface Verdict {
  eligible: boolean | 'uncertain';
  regulation: 'EU261' | 'UK261' | 'none';
  trigger: 'cancellation' | 'delay' | 'denied_boarding' | 'none';
  distance_km: number;
  compensation_eur: number;
  reduction_applied: boolean;
  reason_code:
    | 'reason_unknown'
    | 'extraordinary_circumstances'
    | 'airline_fault'
    | 'outside_scope'
    | 'delay_under_3h'
    | 'flight_not_found'
    | null;
  confidence: 'high' | 'medium_reason_unclear';
  explanation_notes?: string;
}

/**
 * Output from Cysic explanation layer
 */
export interface Explanation {
  summary: string; // Plain English explanation of verdict
  claim_letter: string; // Formal claim letter text
}

/**
 * Complete ASP response
 */
export interface ASPResponse {
  verdict: Verdict;
  explanation: string; // Plain text summary
  claim_letter: string; // Formal letter
  disclaimer: string; // Legal disclaimer
  timestamp: string; // ISO 8601
}

/**
 * ASP request contract
 */
export interface ASPRequest {
  flight_number: string;
  flight_date: string; // YYYY-MM-DD
}
