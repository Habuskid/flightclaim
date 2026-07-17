# FlightClaim

An OKX.AI Agent Service Provider (ASP) that deterministically evaluates EU261 flight compensation eligibility.

## What It Is (and Isn't)
FlightClaim is an automated backend agent strictly built for the OKX.AI Agent Marketplace. It ingests flight telemetry, cross-references it against European Union Regulation 261/2004, and returns an eligibility verdict alongside an AI-generated claim letter. 

It is **not** a chatbot, it is **not** a law firm, and it does **not** file claims on your behalf. It provides automated, deterministic estimates based on publicly available flight data.

## Architecture

```text
User Prompt (OKX.AI) 
       │ 
 [x402 Payment Validation] ──(Fail)──> 402 Payment Required
       │ 
 [Rate Limiter] (Upstash Redis)
       │
 [FlightClaim ASP] ──(Fetch)──> AviationStack API (Live Telemetry)
       │
 [Regulation Engine] (EU261 Logic)
       │
 [Cysic Inference] (Drafts Claim Letter)
       │
 OKX.AI JSON Response
```

## API Contract

**Endpoint:** `POST /api/flightclaim`

**Request Body:**
```json
{
  "flight_number": "RYR557",
  "flight_date": "2026-07-16"
}
```

**Response Body (Success):**
```json
{
  "status": "success",
  "data": {
    "flight_number": "RYR557",
    "date": "2026-07-16",
    "verdict": {
      "is_eligible": true,
      "estimated_compensation": 250,
      "currency": "EUR",
      "regulation": "EU261",
      "trigger_event": "delay",
      "confidence": "high",
      "reason": "Delay exceeding 3 hours on a flight under 1500km."
    },
    "explanation": "Based on live telemetry, flight RYR557 was delayed by 4 hours..."
  }
}
```

## Setup Instructions

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env.local` file and populate the required environment variables:
   ```env
   # Flight Telemetry
   AVIATIONSTACK_API_KEY=
   AVIATIONSTACK_BASE_URL=http://api.aviationstack.com/v1
   AVIATIONSTACK_MONTHLY_LIMIT=
   
   # AI Inference
   CYSIC_API_KEY=
   CYSIC_BASE_URL=https://token-ai.cysic.xyz/v1
   
   # Rate Limiting
   UPSTASH_REDIS_REST_URL=
   UPSTASH_REDIS_REST_TOKEN=
   
   # OKX Payment Gateway
   OKX_API_KEY=
   OKX_SECRET_KEY=
   OKX_PASSPHRASE=
   PAY_TO_ADDRESS=
   X402_PRICE=0.10
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

## Tech Stack

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white)

- **Framework:** Next.js 16.2.6 / React 19
- **Language:** TypeScript 5.7.3
- **Monetization:** OKX Web3 x402-next (0.1.1)
- **Infrastructure:** Upstash Redis (1.38.0)
- **Styling:** Tailwind CSS 4.2.0
- **Testing:** Jest 30.4.2

## Disclaimer
FlightClaim provides automated estimates under EU Regulation 261/2004. **This is not legal advice.** FlightClaim relies on third-party telemetry, which may be incomplete or disputed by the airline. UK261 and other international passenger rights regimes are explicitly out of scope for this version. Users must verify their eligibility with a designated national enforcement body before formally submitting a claim.
