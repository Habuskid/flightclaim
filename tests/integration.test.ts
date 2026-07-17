import { evaluateEligibility } from '../lib/regulation-engine';
import { fetchFlightData } from '../lib/aviationstack-client';
import { calculateDistance } from '../lib/distance-calculator';
import { Verdict } from '../lib/types';

describe('Integration: Flight Data → Regulation Engine → Verdict', () => {
  beforeEach(() => {
    process.env.MOCK_MODE = 'true';
  });

  describe('Test Flight EU123 (Cancelled, CDG→LHR)', () => {
    it('should produce correct verdict for cancelled intra-EU flight', async () => {
      // Step 1: Fetch flight data
      const flightData = await fetchFlightData('EU123', '2026-07-15');
      console.log('[v0] Fetched EU123:', flightData);

      expect(flightData).toBeDefined();
      expect(flightData?.flight_status).toBe('cancelled');

      // Step 2: Calculate distance
      const distance = calculateDistance(flightData!.departure.iata, flightData!.arrival.iata);
      console.log('[v0] Distance CDG→LHR:', distance, 'km');

      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeCloseTo(347, -1);

      // Step 3: Evaluate eligibility (regulation engine)
      const verdict = evaluateEligibility(flightData!, distance);
      console.log('[v0] Verdict for EU123:', JSON.stringify(verdict, null, 2));

      // Verify verdict structure
      expect(verdict.eligible).toBe(true);
      expect(verdict.regulation).toBe('EU261');
      expect(verdict.trigger).toBe('cancellation');
      expect(verdict.compensation_eur).toBe(250);
      expect(verdict.distance_km).toBe(distance);
      expect(verdict.reason_code).toBe('airline_fault');

      // Verify verdict doesn't change on re-evaluation
      const verdict2 = evaluateEligibility(flightData!, distance);
      expect(JSON.stringify(verdict)).toEqual(JSON.stringify(verdict2));
    });
  });

  describe('Test Flight EU456 (Delayed 4h, FCO→CDG)', () => {
    it('should produce correct verdict for delayed intra-EU flight', async () => {
      // Step 1: Fetch flight data
      const flightData = await fetchFlightData('EU456', '2026-07-16');
      console.log('[v0] Fetched EU456:', flightData);

      expect(flightData).toBeDefined();
      expect(flightData?.flight_status).toBe('landed');
      expect(flightData?.arrival.delay).toBe(240); // 4 hours

      // Step 2: Calculate distance
      const distance = calculateDistance(flightData!.departure.iata, flightData!.arrival.iata);
      console.log('[v0] Distance FCO→CDG:', distance, 'km');

      expect(distance).toBeGreaterThan(0);

      // Step 3: Evaluate eligibility
      const verdict = evaluateEligibility(flightData!, distance);
      console.log('[v0] Verdict for EU456:', JSON.stringify(verdict, null, 2));

      expect(verdict.eligible).toBe(true);
      expect(verdict.regulation).toBe('EU261');
      expect(verdict.trigger).toBe('delay');
      expect(verdict.compensation_eur).toBe(250); // Short distance tier
      expect(verdict.distance_km).toBe(distance);
    });
  });

  describe('Test Flight EU789 (On-Time, BCN→AMS)', () => {
    it('should produce not-eligible verdict for on-time flight', async () => {
      // Step 1: Fetch flight data
      const flightData = await fetchFlightData('EU789', '2026-07-17');
      console.log('[v0] Fetched EU789:', flightData);

      expect(flightData).toBeDefined();
      expect(flightData?.flight_status).toBe('landed');
      expect(flightData?.arrival.delay).toBe(0);

      // Step 2: Calculate distance
      const distance = calculateDistance(flightData!.departure.iata, flightData!.arrival.iata);
      console.log('[v0] Distance BCN→AMS:', distance, 'km');

      // Step 3: Evaluate eligibility
      const verdict = evaluateEligibility(flightData!, distance);
      console.log('[v0] Verdict for EU789:', JSON.stringify(verdict, null, 2));

      expect(verdict.eligible).toBe(false);
      expect(verdict.regulation).toBe('EU261');
      expect(verdict.trigger).toBe('none');
      expect(verdict.compensation_eur).toBe(0);
    });
  });

  describe('Test Flight EU999 (Not Found)', () => {
    it('should produce not-found verdict when flight not found', async () => {
      // Step 1: Fetch flight data (should return null)
      const flightData = await fetchFlightData('EU999', '2026-07-18');
      console.log('[v0] Fetched EU999:', flightData);

      expect(flightData).toBeNull();

      // Step 2: Create a minimal flight data object to test regulation engine response
      const minimalFlight = {
        flight_status: 'unknown',
        departure: { iata: '' },
        arrival: { iata: '' },
        airline: { name: 'Unknown' },
      };

      // Step 3: Evaluate eligibility
      const verdict = evaluateEligibility(minimalFlight as any, -1);
      console.log('[v0] Verdict for EU999 (not found):', JSON.stringify(verdict, null, 2));

      expect(verdict.eligible).toBe(false);
      expect(verdict.reason_code).toBe('flight_not_found');
    });
  });

  describe('Verdict Immutability', () => {
    it('should produce consistent verdict across multiple calls', async () => {
      const flightData = await fetchFlightData('EU123', '2026-07-15');
      const distance = calculateDistance(flightData!.departure.iata, flightData!.arrival.iata);

      // Multiple evaluations should yield identical verdicts
      const verdict1 = evaluateEligibility(flightData!, distance);
      const verdict2 = evaluateEligibility(flightData!, distance);
      const verdict3 = evaluateEligibility(flightData!, distance);

      const stringified1 = JSON.stringify(verdict1);
      const stringified2 = JSON.stringify(verdict2);
      const stringified3 = JSON.stringify(verdict3);

      expect(stringified1).toEqual(stringified2);
      expect(stringified2).toEqual(stringified3);

      console.log('[v0] Verdict immutability verified across 3 calls');
    });
  });

  describe('Distance Tier Accuracy', () => {
    it('should correctly assign compensation tiers based on distance', async () => {
      // EU123 is short-haul (347 km) → €250
      const flight1 = await fetchFlightData('EU123', '2026-07-15');
      const distance1 = calculateDistance(flight1!.departure.iata, flight1!.arrival.iata);
      const verdict1 = evaluateEligibility(flight1!, distance1);

      console.log(`[v0] Flight EU123 (${distance1} km):  €${verdict1.compensation_eur}`);
      expect(distance1).toBeLessThanOrEqual(1500);
      expect(verdict1.compensation_eur).toBe(250);

      // EU456 is also short-haul → €250
      const flight2 = await fetchFlightData('EU456', '2026-07-16');
      const distance2 = calculateDistance(flight2!.departure.iata, flight2!.arrival.iata);
      const verdict2 = evaluateEligibility(flight2!, distance2);

      console.log(`[v0] Flight EU456 (${distance2} km): €${verdict2.compensation_eur}`);
      expect(distance2).toBeLessThanOrEqual(1500);
      expect(verdict2.compensation_eur).toBe(250);
    });
  });
});
