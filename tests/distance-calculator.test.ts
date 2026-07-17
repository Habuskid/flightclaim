import { calculateDistance, haversine, getAirport, isEUAirport } from '../lib/distance-calculator';

describe('Distance Calculator', () => {
  describe('haversine function', () => {
    it('should calculate distance between CDG and LHR as approximately 344 km', () => {
      // CDG: 49.0127, 2.5500
      // LHR: 51.4700, -0.4543
      const distance = haversine(49.0127, 2.55, 51.47, -0.4543);
      console.log(`[v0] CDG to LHR distance: ${distance} km`);
      expect(distance).toBeCloseTo(344, -1); // Within 10 km
    });

    it('should calculate distance between JFK and LAX as approximately 3944 km', () => {
      // JFK: 40.6413, -73.7781
      // LAX: 33.9425, -118.4081
      const distance = haversine(40.6413, -73.7781, 33.9425, -118.4081);
      console.log(`[v0] JFK to LAX distance: ${distance} km`);
      expect(distance).toBeCloseTo(3944, -2); // Within 100 km
    });

    it('should return 0 for identical coordinates', () => {
      const distance = haversine(0, 0, 0, 0);
      expect(distance).toBe(0);
    });
  });

  describe('calculateDistance function', () => {
    it('should return distance for valid airport codes', () => {
      const distance = calculateDistance('CDG', 'LHR');
      console.log(`[v0] CDG to LHR (via function): ${distance} km`);
      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeCloseTo(344, -1);
    });

    it('should return -1 for invalid airport codes', () => {
      const distance = calculateDistance('XXX', 'YYY');
      expect(distance).toBe(-1);
    });

    it('should be case-insensitive', () => {
      const distance1 = calculateDistance('cdg', 'lhr');
      const distance2 = calculateDistance('CDG', 'LHR');
      expect(distance1).toBe(distance2);
    });
  });

  describe('getAirport function', () => {
    it('should return airport data for valid IATA code', () => {
      const airport = getAirport('CDG');
      expect(airport).toBeDefined();
      expect(airport?.iata).toBe('CDG');
      expect(airport?.name).toContain('Paris');
    });

    it('should return null for invalid IATA code', () => {
      const airport = getAirport('ZZZ');
      expect(airport).toBeNull();
    });
  });

  describe('isEUAirport function', () => {
    it('should return true for EU airports', () => {
      expect(isEUAirport('CDG')).toBe(true);
      expect(isEUAirport('LHR')).toBe(true);
      expect(isEUAirport('FCO')).toBe(true);
    });

    it('should return false for non-EU airports', () => {
      expect(isEUAirport('JFK')).toBe(false);
      expect(isEUAirport('LAX')).toBe(false);
      expect(isEUAirport('SYD')).toBe(false);
    });

    it('should return false for invalid airports', () => {
      expect(isEUAirport('ZZZ')).toBe(false);
    });
  });
});
