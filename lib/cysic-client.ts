import { Verdict, FlightData, Explanation } from './types';

const API_KEY = process.env.CYSIC_API_KEY;
const API_BASE_URL = process.env.CYSIC_BASE_URL || 'https://token-ai.cysic.xyz/v1';
const MODEL = 'mimo-v2.5';

interface CysicRequest {
  model: string;
  messages: Array<{
    role: 'system' | 'user';
    content: string;
  }>;
  temperature?: number;
  max_tokens?: number;
}

interface CysicResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Call Cysic API with the specified messages
 */
async function callCysicAPI(systemPrompt: string, userMessage: string): Promise<{ response: string; tokens: number }> {
  if (!API_KEY) {
    throw new Error('CYSIC_API_KEY not set');
  }

  const payload: CysicRequest = {
    model: MODEL,
    messages: [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: userMessage,
      },
    ],
    temperature: 0.7,
    max_tokens: 2000,
  };

  console.log('[v0] Calling Cysic API with model:', MODEL);

  try {
    const response = await fetch(`${API_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Cysic API error: ${response.status} ${error}`);
    }

    const data: CysicResponse = await response.json();
    const content = data.choices[0]?.message?.content || '';
    const tokens = data.usage?.total_tokens || 0;

    console.log(`[v0] Cysic response (${tokens} tokens):`, content.slice(0, 100) + '...');

    return {
      response: content,
      tokens,
    };
  } catch (err) {
    console.error('[v0] Cysic API call failed:', err);
    throw err;
  }
}

/**
 * Generate a plain-English explanation of the verdict
 * The verdict is IMMUTABLE — this function only explains it, never alters it
 */
export async function explainVerdict(verdict: Verdict, flightData?: FlightData): Promise<string> {
  const systemPrompt = `You are a passenger-rights explainer for FlightClaim. You will be given a structured verdict (eligibility, amount, trigger, reason) that has already been determined by a deterministic rules engine. Do not recalculate or second-guess the amount or eligibility. Your job is only to explain it in plain, warm, non-legalese English to a passenger who has never heard of EU261. If confidence is "medium_reason_unclear", say clearly that the airline may dispute the cause and that this is an estimate. Always end with: "This is an automated estimate, not legal advice."`;

  const userMessage = `
Verdict:
- Eligible: ${verdict.eligible}
- Regulation: ${verdict.regulation}
- Trigger Event: ${verdict.trigger}
- Compensation (EUR): ${verdict.compensation_eur}
- Distance (km): ${verdict.distance_km}
- Reason Code: ${verdict.reason_code}
- Confidence: ${verdict.confidence}

${flightData ? `Flight Details:
- From: ${flightData.departure.iata} at ${flightData.departure.scheduled}
- To: ${flightData.arrival.iata} at ${flightData.arrival.scheduled}
- Status: ${flightData.flight_status}
- Airline: ${flightData.airline.name}` : ''}

Please explain this verdict in plain English.`;

  const { response, tokens } = await callCysicAPI(systemPrompt, userMessage);
  console.log(`[v0] Explanation tokens used: ${tokens}`);
  return response;
}

/**
 * Generate a formal claim letter based on the verdict
 * The verdict is IMMUTABLE — this function only drafts a letter, never alters amounts or eligibility
 */
export async function generateClaimLetter(verdict: Verdict, flightData: FlightData): Promise<string> {
  const systemPrompt = `You draft a formal but plain-language compensation claim letter to an airline, using the structured verdict provided. Include: passenger's flight details, the regulation cited (EU261), the trigger event, the exact compensation amount already given (do not change it), and a request for payment within 14 days. Do not invent facts not present in the input. Leave [PASSENGER NAME] and [ADDRESS] as placeholders.`;

  const userMessage = `
Verdict Details:
- Eligible: ${verdict.eligible}
- Amount: €${verdict.compensation_eur}
- Trigger: ${verdict.trigger}
- Distance: ${verdict.distance_km} km

Flight Details:
- Flight Number: ${flightData.flight?.iata || flightData.flight?.number || 'N/A'}
- Date: ${flightData.departure.scheduled}
- Departure: ${flightData.departure.iata}
- Arrival: ${flightData.arrival.iata}
- Airline: ${flightData.airline.name}
- Status: ${flightData.flight_status}
${flightData.arrival.delay ? `- Arrival Delay: ${flightData.arrival.delay} minutes` : ''}

Please draft a formal claim letter requesting compensation of €${verdict.compensation_eur}.`;

  const { response, tokens } = await callCysicAPI(systemPrompt, userMessage);
  console.log(`[v0] Claim letter tokens used: ${tokens}`);
  return response;
}

/**
 * Generate both explanation and claim letter (convenience wrapper)
 */
export async function generateExplanation(verdict: Verdict, flightData: FlightData): Promise<Explanation> {
  console.log('[v0] Generating explanation and claim letter from verdict...');

  // Verify verdict before calling AI
  console.log('[v0] Verdict to explain (immutable):', verdict);

  const [explanation, claimLetter] = await Promise.all([
    explainVerdict(verdict, flightData),
    generateClaimLetter(verdict, flightData),
  ]);

  return {
    summary: explanation,
    claim_letter: claimLetter,
  };
}
