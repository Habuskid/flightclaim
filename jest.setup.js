// Mock Cysic API calls for testing
jest.mock('./lib/cysic-client', () => ({
  generateExplanation: jest.fn(async (verdict, flightData) => ({
    summary: `This is a test explanation for a ${verdict.trigger} flight. You are ${verdict.eligible ? '' : 'not '}eligible for €${verdict.compensation_eur}. This is an automated estimate, not legal advice.`,
    claim_letter: `Dear Airline,\n\nI am writing to request compensation for flight ${flightData.flight_number} on ${flightData.departure.scheduled}.\n\nYou owe me €${verdict.compensation_eur} under EU Regulation 261/2004.\n\nPlease confirm receipt and process payment within 14 days.\n\nBest regards,\n[PASSENGER NAME]`,
  })),
}));

// Set default env vars for testing
process.env.MOCK_MODE = 'true';
process.env.AVIATIONSTACK_MONTHLY_LIMIT = '90';
