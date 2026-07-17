import { POST, GET } from '../app/api/flightclaim/route';
import { NextRequest } from 'next/server';

describe('ASP API Endpoint', () => {
  beforeEach(() => {
    process.env.MOCK_MODE = 'true';
  });

  describe('GET /api/flightclaim (Health Check)', () => {
    it('should return health status', async () => {
      const response = await GET();
      const data = await response.json();

      console.log('[v0] Health check response:', data);

      expect(response.status).toBe(200);
      expect(data.status).toBe('ok');
      expect(data.service).toBe('FlightClaim');
      expect(data.timestamp).toBeDefined();
    });
  });

  describe('POST /api/flightclaim (ASP Request)', () => {
    it('should return 400 for missing flight_number', async () => {
      const request = new NextRequest('http://localhost:3000/api/flightclaim', {
        method: 'POST',
        body: JSON.stringify({
          flight_date: '2026-07-15',
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);

      const data = await response.json();
      console.log('[v0] Missing flight_number error:', data);
      expect(data.error).toBeDefined();
    });

    it('should return 400 for invalid date format', async () => {
      const request = new NextRequest('http://localhost:3000/api/flightclaim', {
        method: 'POST',
        body: JSON.stringify({
          flight_number: 'EU123',
          flight_date: '07/15/2026', // Wrong format
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);

      const data = await response.json();
      console.log('[v0] Invalid date format error:', data);
      expect(data.error).toBeDefined();
    });

    it('should process valid request for cancelled flight EU123', async () => {
      const request = new NextRequest('http://localhost:3000/api/flightclaim', {
        method: 'POST',
        body: JSON.stringify({
          flight_number: 'eu123', // Test lowercase
          flight_date: '2026-07-15',
        }),
      });

      const response = await POST(request);
      console.log('[v0] ASP response status:', response.status);

      expect(response.status).toBe(200);

      const data = await response.json();
      console.log('[v0] ASP response for EU123:', JSON.stringify(data, null, 2).slice(0, 300) + '...');

      // Verify response structure
      expect(data.verdict).toBeDefined();
      expect(data.explanation).toBeDefined();
      expect(data.claim_letter).toBeDefined();
      expect(data.disclaimer).toBeDefined();
      expect(data.timestamp).toBeDefined();

      // Verify verdict content
      expect(data.verdict.eligible).toBe(true);
      expect(data.verdict.regulation).toBe('EU261');
      expect(data.verdict.trigger).toBe('cancellation');
      expect(data.verdict.compensation_eur).toBe(250);

      // Verify explanation contains disclaimer
      expect(data.explanation).toContain('legal advice');
    });

    it('should process valid request for delayed flight EU456', async () => {
      const request = new NextRequest('http://localhost:3000/api/flightclaim', {
        method: 'POST',
        body: JSON.stringify({
          flight_number: 'EU456',
          flight_date: '2026-07-16',
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(200);

      const data = await response.json();
      console.log('[v0] ASP response for EU456 (verdict):', data.verdict);

      expect(data.verdict.eligible).toBe(true);
      expect(data.verdict.trigger).toBe('delay');
      expect(data.verdict.compensation_eur).toBe(250);
    });

    it('should return 404 for unknown flight', async () => {
      const request = new NextRequest('http://localhost:3000/api/flightclaim', {
        method: 'POST',
        body: JSON.stringify({
          flight_number: 'EU999',
          flight_date: '2026-07-18',
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(404);

      const data = await response.json();
      console.log('[v0] Not found response:', data.verdict);

      expect(data.verdict.reason_code).toBe('flight_not_found');
      expect(data.verdict.eligible).toBe(false);
    });

    it('should include complete response structure', async () => {
      const request = new NextRequest('http://localhost:3000/api/flightclaim', {
        method: 'POST',
        body: JSON.stringify({
          flight_number: 'EU123',
          flight_date: '2026-07-15',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      // Verify all required fields present
      expect(data).toHaveProperty('verdict');
      expect(data.verdict).toHaveProperty('eligible');
      expect(data.verdict).toHaveProperty('regulation');
      expect(data.verdict).toHaveProperty('trigger');
      expect(data.verdict).toHaveProperty('distance_km');
      expect(data.verdict).toHaveProperty('compensation_eur');
      expect(data.verdict).toHaveProperty('reason_code');
      expect(data.verdict).toHaveProperty('confidence');

      expect(data).toHaveProperty('explanation');
      expect(data).toHaveProperty('claim_letter');
      expect(data).toHaveProperty('disclaimer');
      expect(data).toHaveProperty('timestamp');

      console.log('[v0] Response structure complete');
    });
  });
});
