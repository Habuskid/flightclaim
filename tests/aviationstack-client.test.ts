import { fetchFlightData, getUsageStats } from '../lib/aviationstack-client';

describe('AviationStack Client', () => {
  beforeEach(() => {
    // Set to mock mode for tests
    process.env.MOCK_MODE = 'true';
  });

  describe('Mock Mode', () => {
    it('should fetch EU123 (cancelled flight) from mock', async () => {
      const flight = await fetchFlightData('EU123', '2026-07-15');
      console.log('[v0] Fetched flight EU123:', flight);

      expect(flight).toBeDefined();
      expect(flight?.flight_number).toBe('EU123');
      expect(flight?.flight_status).toBe('cancelled');
      expect(flight?.departure.iata).toBe('CDG');
      expect(flight?.arrival.iata).toBe('LHR');
    });

    it('should fetch EU456 (delayed flight) from mock', async () => {
      const flight = await fetchFlightData('EU456', '2026-07-16');
      console.log('[v0] Fetched flight EU456:', flight);

      expect(flight).toBeDefined();
      expect(flight?.flight_number).toBe('EU456');
      expect(flight?.flight_status).toBe('landed');
      expect(flight?.arrival.delay).toBe(240); // 4 hours
    });

    it('should fetch EU789 (on-time flight) from mock', async () => {
      const flight = await fetchFlightData('EU789', '2026-07-17');
      console.log('[v0] Fetched flight EU789:', flight);

      expect(flight).toBeDefined();
      expect(flight?.flight_status).toBe('landed');
      expect(flight?.arrival.delay).toBe(0);
    });

    it('should return null for unknown flight', async () => {
      const flight = await fetchFlightData('UNKNOWN', '2026-07-18');
      console.log('[v0] Fetched unknown flight:', flight);

      expect(flight).toBeNull();
    });
  });

  describe('Usage Tracking', () => {
    it('should track calls and show remaining budget', async () => {
      const statsBefore = getUsageStats();
      console.log('[v0] Usage stats before:', statsBefore);

      await fetchFlightData('EU123', '2026-07-15');

      const statsAfter = getUsageStats();
      console.log('[v0] Usage stats after:', statsAfter);

      expect(statsAfter.used).toBeGreaterThan(statsBefore.used);
      expect(statsAfter.remaining).toBeLessThan(statsBefore.remaining);
    });

    it('should report limit and remaining calls', async () => {
      const stats = getUsageStats();
      console.log('[v0] Current usage:', stats);

      expect(stats.limit).toBe(90); // Default from env
      expect(stats.remaining).toBeLessThanOrEqual(stats.limit);
      expect(stats.used).toBeGreaterThanOrEqual(0);
    });
  });
});
