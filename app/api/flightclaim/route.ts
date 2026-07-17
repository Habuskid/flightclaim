import { NextRequest, NextResponse } from 'next/server';
import { withX402 } from '@okxweb3/x402-next';
import { getResourceServer } from '@/lib/okx-payment';
import { fetchFlightData } from '@/lib/aviationstack-client';
import { evaluateEligibility } from '@/lib/regulation-engine';
import { calculateDistance } from '@/lib/distance-calculator';
import { generateExplanation } from '@/lib/cysic-client';
import { ASPRequest, ASPResponse } from '@/lib/types';
import { Redis } from '@upstash/redis';

const DISCLAIMER =
  'This is an automated estimate, not legal advice. We strongly advise consulting with a lawyer or legal professional before requesting a refund or filing a formal claim.';

/**
 * Validate ASP request
 */
function validateRequest(body: any): { valid: boolean; error?: string; data?: ASPRequest } {
  if (!body) {
    return { valid: false, error: 'Request body is required' };
  }

  if (!body.flight_number || typeof body.flight_number !== 'string') {
    return { valid: false, error: 'flight_number (string) is required' };
  }

  const flightNumber = body.flight_number.toUpperCase().trim();
  if (!/^[A-Z0-9]{2,10}$/.test(flightNumber)) {
    return { valid: false, error: 'flight_number must be 2-10 alphanumeric characters' };
  }

  if (!body.flight_date || typeof body.flight_date !== 'string') {
    return { valid: false, error: 'flight_date (YYYY-MM-DD) is required' };
  }

  // Validate flight_date format (basic check)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(body.flight_date)) {
    return { valid: false, error: 'flight_date must be in YYYY-MM-DD format' };
  }

  return {
    valid: true,
    data: {
      flight_number: flightNumber,
      flight_date: body.flight_date.trim(),
    },
  };
}

/**
 * Main ASP endpoint: POST /api/flightclaim
 * Accepts: { flight_number: string, flight_date: string }
 * Returns: Complete ASP response with verdict, explanation, and claim letter
 */
// Redis based rate limiter: max 10 requests per minute per IP
const redis = Redis.fromEnv();

async function checkRateLimit(ip: string): Promise<boolean> {
  const key = `ratelimit:${ip}`;
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, 60);
  }
  return count <= 10;
}

const postHandler = async (request: NextRequest): Promise<NextResponse> => {
  const startTime = Date.now();
  
  // Apply rate limiting
  const ip = request.headers.get('x-forwarded-for') || request.ip || 'unknown';
  if (!(await checkRateLimit(ip))) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
  }

  try {
    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          error: 'Invalid JSON in request body',
        },
        { status: 400 }
      );
    }

    // Validate
    const validation = validateRequest(body);
    if (!validation.valid) {
      return NextResponse.json(
        {
          error: validation.error,
        },
        { status: 400 }
      );
    }

    const { flight_number, flight_date } = validation.data!;

    console.log(`[v0] ASP request: ${flight_number} on ${flight_date}`);

    // Step 1: Fetch flight data
    let flightData;
    try {
      flightData = await fetchFlightData(flight_number, flight_date);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);

      if (errorMsg.includes('quota') || errorMsg.includes('budget')) {
        console.error('[v0] Budget exceeded:', errorMsg);
        return NextResponse.json(
          {
            error: 'Monthly AviationStack quota exhausted. Try again next month.',
          },
          { status: 429 }
        );
      }

      console.error('[v0] Error fetching flight:', errorMsg);
      return NextResponse.json(
        {
          error: 'Failed to fetch flight data',
        },
        { status: 500 }
      );
    }

    // Step 2: Handle flight not found
    if (!flightData) {
      console.log(`[v0] Flight not found: ${flight_number}`);
      const response: ASPResponse = {
        verdict: {
          eligible: false,
          regulation: 'none',
          trigger: 'none',
          distance_km: -1,
          compensation_eur: 0,
          reduction_applied: false,
          reason_code: 'flight_not_found',
          confidence: 'high',
        },
        explanation: 'Flight not found in the AviationStack database. Please verify the flight number and date.',
        claim_letter: '',
        disclaimer: DISCLAIMER,
        timestamp: new Date().toISOString(),
      };

      return NextResponse.json(response, { status: 404 });
    }

    // Step 3: Calculate distance
    const distance = calculateDistance(flightData.departure.iata, flightData.arrival.iata);

    if (distance === -1) {
      console.log(`[v0] Unknown airports for flight ${flight_number}`);
      return NextResponse.json(
        {
          error: 'One or both airports not found in database',
        },
        { status: 400 }
      );
    }

    console.log(`[v0] Distance calculated: ${distance} km`);

    // Step 4: Evaluate eligibility (regulation engine)
    const verdict = evaluateEligibility(flightData, distance);
    console.log('[v0] Verdict determined:', verdict);

    // Step 5: Generate explanation and claim letter (Cysic layer)
    let explanation: string = '';
    let claimLetter: string = '';

    try {
      const explanationResult = await generateExplanation(verdict, flightData);
      explanation = explanationResult.summary;
      claimLetter = explanationResult.claim_letter;
      console.log('[v0] Explanation and claim letter generated');
    } catch (err) {
      // If Cysic fails, provide fallback text (still return valid response)
      console.error('[v0] Cysic call failed, using fallback:', err);
      explanation =
        verdict.eligible
          ? `You are eligible for €${verdict.compensation_eur} under EU261 due to ${verdict.trigger}. ${DISCLAIMER}`
          : `You are not eligible for compensation. ${DISCLAIMER}`;
      claimLetter = 'Unable to generate claim letter at this time. Please use the explanation above to draft a letter manually.';
    }

    // Step 6: Return complete response
    const response: ASPResponse = {
      verdict,
      explanation,
      claim_letter: claimLetter,
      disclaimer: DISCLAIMER,
      timestamp: new Date().toISOString(),
    };

    const elapsed = Date.now() - startTime;
    console.log(`[v0] ASP response ready (${elapsed}ms)`);

    return NextResponse.json(response, { status: 200 });
  } catch (err) {
    console.error('[v0] Unexpected error in ASP:', err);
    return NextResponse.json(
      {
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
};

const x402Handler = withX402(
  postHandler,
  {
    accepts: {
      scheme: 'exact',
      price: `$${process.env.X402_PRICE || '0.10'}`,
      network: 'eip155:196',
      payTo: process.env.PAY_TO_ADDRESS || '',
    },
    description: 'FlightClaim eligibility assessment and claim generation',
  },
  getResourceServer(),
  undefined,
  undefined,
  false
);

export const POST = async (req: NextRequest) => {
  try {
    const server = getResourceServer();
    
    // Explicitly initialize the server so X402 knows what schemes are supported.
    // If the facilitator network is down, this will throw an error.
    if (typeof server.initialize === 'function') {
      try {
        await server.initialize();
      } catch (e: any) {
        // If it throws because it's already initialized, we can ignore.
        // Otherwise, we MUST throw to prevent falling through to the handler with an uninitialized state.
        if (!e.message?.includes('already initialized')) {
          throw new Error(`Facilitator initialization failed: ${e.message}`);
        }
      }
    }
    
    // Pass the request to the wrapped handler
    return await x402Handler(req);
  } catch (error: any) {
    console.error('[v0] Error in x402 wrapper:', error);
    // Explicitly return 402 Payment Required for any facilitator or payment error.
    // This guarantees FAIL-CLOSED behavior. The real handler will never be reached.
    return NextResponse.json({ error: 'Payment Required or Facilitator Error' }, { status: 402 });
  }
};

/**
 * Health check endpoint: GET /api/flightclaim
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    {
      status: 'ok',
      service: 'FlightClaim',
      version: '1.0',
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}
