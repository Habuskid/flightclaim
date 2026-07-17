import { evaluateEligibility } from '../lib/regulation-engine';
import { FlightData } from '../lib/types';

describe('Regulation Engine (EU261)', () => {
  /**
   * Test Case A: CDG→LHR cancelled, eligible, €250
   * Distance: ~347 km (intra-EU, ≤1500 km tier)
   */
  describe('Test Case A: Intra-EU Cancellation (CDG→LHR)', () => {
    const flightA: FlightData = {
      flight_number: 'AF123',
      flight_status: 'cancelled',
      departure: {
        iata: 'CDG',
        scheduled: '2026-07-15T10:00:00Z',
        delay: 0,
      },
      arrival: {
        iata: 'LHR',
        scheduled: '2026-07-15T11:00:00Z',
        delay: 0,
      },
      airline: {
        name: 'Air France',
        iata: 'AF',
      },
    };

    it('should be eligible for €250 compensation', () => {
      const verdict = evaluateEligibility(flightA, 347);
      console.log('[v0] Test A verdict:', JSON.stringify(verdict, null, 2));

      expect(verdict.eligible).toBe(true);
      expect(verdict.regulation).toBe('EU261');
      expect(verdict.trigger).toBe('cancellation');
      expect(verdict.compensation_eur).toBe(250);
      expect(verdict.distance_km).toBe(347);
      expect(verdict.reason_code).toBe('airline_fault');
    });
  });

  /**
   * Test Case B: JFK→LAX delayed 4h, NOT eligible (outside EU261)
   * Distance: ~3974 km (long-haul, would be €600 if eligible, but not in scope)
   */
  describe('Test Case B: US Domestic Delay (JFK→LAX)', () => {
    const flightB: FlightData = {
      flight_number: 'AA456',
      flight_status: 'landed',
      departure: {
        iata: 'JFK',
        scheduled: '2026-07-15T10:00:00Z',
        delay: 240,
      },
      arrival: {
        iata: 'LAX',
        scheduled: '2026-07-15T14:00:00Z',
        delay: 240, // 4 hours = 240 minutes
      },
      airline: {
        name: 'American Airlines',
        iata: 'AA',
      },
    };

    it('should not be eligible (outside EU261 scope)', () => {
      const verdict = evaluateEligibility(flightB, 3974);
      console.log('[v0] Test B verdict:', JSON.stringify(verdict, null, 2));

      expect(verdict.eligible).toBe(false);
      expect(verdict.regulation).toBe('none');
      expect(verdict.compensation_eur).toBe(0);
      expect(verdict.reason_code).toBe('outside_scope');
      expect(verdict.confidence).toBe('high');
    });
  });

  /**
   * Test Case C: FCO→CDG delayed 2h, NOT eligible (under 3h threshold)
   * Distance: ~1500 km
   */
  describe('Test Case C: Short Delay (FCO→CDG, 2h)', () => {
    const flightC: FlightData = {
      flight_number: 'IZ789',
      flight_status: 'landed',
      departure: {
        iata: 'FCO',
        scheduled: '2026-07-15T10:00:00Z',
        delay: 0,
      },
      arrival: {
        iata: 'CDG',
        scheduled: '2026-07-15T12:00:00Z',
        delay: 120, // 2 hours = 120 minutes
      },
      airline: {
        name: 'ITA Airways',
        iata: 'IZ',
      },
    };

    it('should not be eligible (delay < 3 hours)', () => {
      const verdict = evaluateEligibility(flightC, 1485);
      console.log('[v0] Test C verdict:', JSON.stringify(verdict, null, 2));

      expect(verdict.eligible).toBe(false);
      expect(verdict.regulation).toBe('EU261');
      expect(verdict.trigger).toBe('none'); // Trigger is 'none' because delay < 3h
      expect(verdict.compensation_eur).toBe(0);
      expect(verdict.reason_code).toBe(null);
      expect(verdict.confidence).toBe('high');
    });
  });

  /**
   * Test Case D: CDG→BCN cancelled, extraordinary circumstances (reason_unknown)
   * Distance: ~610 km (eligible tier: €250)
   * Should be eligible but flagged uncertain
   */
  describe('Test Case D: Cancellation, Extraordinary Circumstances Unknown (CDG→BCN)', () => {
    const flightD: FlightData = {
      flight_number: 'BA234',
      flight_status: 'cancelled',
      departure: {
        iata: 'CDG',
        scheduled: '2026-07-15T14:00:00Z',
        delay: 0,
      },
      arrival: {
        iata: 'BCN',
        scheduled: '2026-07-15T16:00:00Z',
        delay: 0,
      },
      airline: {
        name: 'British Airways',
        iata: 'BA',
      },
    };

    it('should be eligible for cancellation (high confidence on trigger)', () => {
      const verdict = evaluateEligibility(flightD, 610);
      console.log('[v0] Test D verdict:', JSON.stringify(verdict, null, 2));

      expect(verdict.eligible).toBe(true);
      expect(verdict.regulation).toBe('EU261');
      expect(verdict.trigger).toBe('cancellation');
      expect(verdict.compensation_eur).toBe(250);
      expect(verdict.reason_code).toBe('airline_fault');
    });
  });

  /**
   * Test Case E: Long-haul delay (CDG→SYD, 5h delay)
   * Distance: ~16963 km (eligible tier: €600)
   */
  describe('Test Case E: Long-Haul Delay (CDG→SYD, 5h)', () => {
    const flightE: FlightData = {
      flight_number: 'AF999',
      flight_status: 'landed',
      departure: {
        iata: 'CDG',
        scheduled: '2026-07-15T22:00:00Z',
        delay: 300,
      },
      arrival: {
        iata: 'SYD',
        scheduled: '2026-07-16T16:00:00Z',
        delay: 300, // 5 hours = 300 minutes
      },
      airline: {
        name: 'Air France',
        iata: 'AF',
      },
    };

    it('should be eligible for €600 (long-haul tier)', () => {
      const verdict = evaluateEligibility(flightE, 16963);
      console.log('[v0] Test E verdict:', JSON.stringify(verdict, null, 2));

      expect(verdict.eligible).toBe(true);
      expect(verdict.regulation).toBe('EU261');
      expect(verdict.trigger).toBe('delay');
      expect(verdict.compensation_eur).toBe(600);
      expect(verdict.distance_km).toBe(16963);
    });
  });

  /**
   * Test Case F: Mid-range distance (JFK→CDG, cancelled)
   * Distance: ~5836 km, but JFK is US; arrival at CDG (EU airport)
   * Since airline is likely US-based, not EU261 scope
   */
  describe('Test Case F: US Airline to EU, Cancelled (JFK→CDG)', () => {
    const flightF: FlightData = {
      flight_number: 'UA567',
      flight_status: 'cancelled',
      departure: {
        iata: 'JFK',
        scheduled: '2026-07-15T19:00:00Z',
        delay: 0,
      },
      arrival: {
        iata: 'CDG',
        scheduled: '2026-07-16T08:00:00Z',
        delay: 0,
      },
      airline: {
        name: 'United Airlines',
        iata: 'UA',
      },
    };

    it('should not be eligible (no EU departure and non-EU airline)', () => {
      const verdict = evaluateEligibility(flightF, 5836);
      console.log('[v0] Test F verdict:', JSON.stringify(verdict, null, 2));

      expect(verdict.eligible).toBe(false);
      expect(verdict.reason_code).toBe('outside_scope');
    });
  });

  /**
   * Test Case G: EU→EU, mid-range (CDG→MAD, delayed 5h)
   * Distance: ~1270 km (€250 tier)
   */
  describe('Test Case G: EU→EU Mid-Range Delay (CDG→MAD, 5h)', () => {
    const flightG: FlightData = {
      flight_number: 'AF111',
      flight_status: 'landed',
      departure: {
        iata: 'CDG',
        scheduled: '2026-07-15T09:00:00Z',
        delay: 300,
      },
      arrival: {
        iata: 'MAD',
        scheduled: '2026-07-15T12:00:00Z',
        delay: 300,
      },
      airline: {
        name: 'Air France',
        iata: 'AF',
      },
    };

    it('should be eligible for €250 (short distance tier)', () => {
      const verdict = evaluateEligibility(flightG, 1270);
      console.log('[v0] Test G verdict:', JSON.stringify(verdict, null, 2));

      expect(verdict.eligible).toBe(true);
      expect(verdict.compensation_eur).toBe(250);
      expect(verdict.trigger).toBe('delay');
      expect(verdict.reason_code).toBe('airline_fault');
    });
  });

  /**
   * Test Case H: Boundary case (1500 km exactly, cancelled)
   * Distance: 1500 km → €250 tier (≤1500 km)
   */
  describe('Test Case H: Distance Boundary (1500 km, Cancelled)', () => {
    const flightH: FlightData = {
      flight_number: 'U2888',
      flight_status: 'cancelled',
      departure: {
        iata: 'CDG',
        scheduled: '2026-07-15T06:00:00Z',
      },
      arrival: {
        iata: 'AMS',
        scheduled: '2026-07-15T09:00:00Z',
      },
      airline: {
        name: 'easyJet',
        iata: 'U2',
      },
    };

    it('should be eligible for €250 (boundary at 1500 km)', () => {
      const verdict = evaluateEligibility(flightH, 1500);
      console.log('[v0] Test H verdict:', JSON.stringify(verdict, null, 2));

      expect(verdict.eligible).toBe(true);
      expect(verdict.compensation_eur).toBe(250);
    });
  });

  /**
   * Test Case I: Boundary case (3500 km, cancelled)
   * Distance: 3500 km → €400 tier (1500–3500 km)
   */
  describe('Test Case I: Distance Boundary (3500 km, Cancelled)', () => {
    const flightI: FlightData = {
      flight_number: 'BA444',
      flight_status: 'cancelled',
      departure: {
        iata: 'FRA',
        scheduled: '2026-07-15T08:00:00Z',
      },
      arrival: {
        iata: 'DXB',
        scheduled: '2026-07-15T18:00:00Z',
      },
      airline: {
        name: 'British Airways',
        iata: 'BA',
      },
    };

    it('should be eligible for €400 (boundary at 3500 km)', () => {
      const verdict = evaluateEligibility(flightI, 3500);
      console.log('[v0] Test I verdict:', JSON.stringify(verdict, null, 2));

      expect(verdict.eligible).toBe(true);
      expect(verdict.compensation_eur).toBe(400);
    });
  });

  /**
   * Test Case J: Long-haul boundary (3501 km, cancelled)
   * Distance: 3501 km → €600 tier (>3500 km)
   */
  describe('Test Case J: Long-Haul Boundary (3501 km, Cancelled)', () => {
    const flightJ: FlightData = {
      flight_number: 'QR888',
      flight_status: 'cancelled',
      departure: {
        iata: 'CDG',
        scheduled: '2026-07-15T22:00:00Z',
      },
      arrival: {
        iata: 'SYD',
        scheduled: '2026-07-16T16:00:00Z',
      },
      airline: {
        name: 'Qatar Airways',
        iata: 'QR',
      },
    };

    it('should be eligible for €600 (>3500 km)', () => {
      const verdict = evaluateEligibility(flightJ, 3501);
      console.log('[v0] Test J verdict:', JSON.stringify(verdict, null, 2));

      expect(verdict.eligible).toBe(true);
      expect(verdict.compensation_eur).toBe(600);
    });
  });
});
