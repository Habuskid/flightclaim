import { FlightData } from './types';
import { Redis } from '@upstash/redis';

const MONTHLY_LIMIT = parseInt(process.env.AVIATIONSTACK_MONTHLY_LIMIT || '90');
const API_KEY = process.env.AVIATIONSTACK_API_KEY;
const API_BASE_URL = process.env.AVIATIONSTACK_BASE_URL || 'http://api.aviationstack.com/v1';

const redis = Redis.fromEnv();

/**
 * Atomically check and acquire budget (read-check-write) using Redis
 */
export async function acquireBudget(flight_number: string, flight_date: string): Promise<{ allowed: boolean; remaining: number; error?: string }> {
  const now = new Date();
  const currentMonth = now.toISOString().slice(0, 7);
  const key = `aviationstack_usage:${currentMonth}`;

  const total_calls = await redis.incr(key);

  if (total_calls > MONTHLY_LIMIT) {
    await redis.decr(key);
    return {
      allowed: false,
      remaining: 0,
      error: `Monthly AviationStack quota reached (${MONTHLY_LIMIT} calls). Try again next month.`,
    };
  }

  // Set expiry to 60 days on the first call of the month
  if (total_calls === 1) {
    await redis.expire(key, 60 * 60 * 24 * 60);
  }

  return {
    allowed: true,
    remaining: MONTHLY_LIMIT - total_calls,
  };
}

/**
 * Update the status of a pending call or rollback on error
 */
async function updateUsageStatus(flight_number: string, flight_date: string, status: string, isError: boolean = false): Promise<void> {
  if (isError) {
    const now = new Date();
    const currentMonth = now.toISOString().slice(0, 7);
    const key = `aviationstack_usage:${currentMonth}`;
    await redis.decr(key);
  }
}


/**
 * Fetch real flight data from AviationStack API
 */
async function fetchRealFlightData(flight_number: string, flight_date: string): Promise<FlightData | null> {
  if (!API_KEY) {
    throw new Error('AVIATIONSTACK_API_KEY not set. Set it or use MOCK_MODE=true');
  }

  try {
    // Free tier doesn't support flight_date (historical data), so we only query the flight_iata for real-time status
    const url = `${API_BASE_URL}/flights?access_key=${API_KEY}&flight_iata=${encodeURIComponent(flight_number)}`;

    console.log('[v0] Fetching flight data from AviationStack:', flight_number, flight_date);

    const response = await fetch(url);
    const data = await response.json();

    if (data.data && data.data.length > 0) {
      return data.data[0] as FlightData;
    }

    return null;
  } catch (err) {
    // Mask API key in logged error messages
    const safeError = err instanceof Error ? err.message.replace(new RegExp(API_KEY, 'g'), '***') : String(err);
    console.error('[v0] Error fetching from AviationStack:', safeError);
    throw new Error(safeError);
  }
}

/**
 * Main public function: fetch flight data (mock or real)
 * @param flight_number Flight IATA/number (e.g., "AF123")
 * @param flight_date Date in YYYY-MM-DD format
 * @returns Flight data or null if not found
 * @throws Error if quota exceeded or API fails
 */
export async function fetchFlightData(flight_number: string, flight_date: string): Promise<FlightData | null> {
  // Check and acquire budget atomically for real calls
  const budget = await acquireBudget(flight_number, flight_date);
  if (!budget.allowed) {
    throw new Error(budget.error);
  }

  console.log(`[v0] Fetching real flight: ${flight_number} on ${flight_date} (${budget.remaining} calls remaining)`);

  try {
    const result = await fetchRealFlightData(flight_number, flight_date);
    await updateUsageStatus(flight_number, flight_date, result ? 'real_found' : 'real_notfound');
    return result;
  } catch (err) {
    await updateUsageStatus(flight_number, flight_date, 'error', true);
    throw err;
  }
}

/**
 * Get current usage stats (for debugging/monitoring)
 */
export async function getUsageStats(): Promise<{
  month: string;
  used: number;
  limit: number;
  remaining: number;
}> {
  const now = new Date();
  const currentMonth = now.toISOString().slice(0, 7);
  const key = `aviationstack_usage:${currentMonth}`;
  
  const val = await redis.get<number>(key);
  const used = val || 0;

  return {
    month: currentMonth,
    used,
    limit: MONTHLY_LIMIT,
    remaining: MONTHLY_LIMIT - used,
  };
}
