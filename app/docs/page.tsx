export default function DocsPage() {
  return (
    <div className="py-24 max-w-3xl mx-auto min-h-screen">
      <div className="mb-20">
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 mb-4">Documentation</h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">Understanding how to interact with the FlightClaim Agent on OKX.AI.</p>
      </div>

      <div className="space-y-16 relative z-10">
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg border border-zinc-200 dark:border-white/[0.1] bg-white dark:bg-[#0a0a0a] text-zinc-700 dark:text-zinc-300 shadow-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <h2 className="text-xl font-medium text-zinc-900 dark:text-zinc-100 tracking-tight">Agent Interaction</h2>
          </div>
          
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6 leading-relaxed max-w-2xl">
            FlightClaim is not exposed as a traditional REST API. Instead, it operates autonomously as an <strong>Agent Service Provider (ASP)</strong> directly on the OKX.AI Agent Marketplace. You interact with the agent natively through the OKX interface using natural language prompts.
          </p>

          <div className="rounded-2xl border border-zinc-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0a0a0a] shadow-[0_2px_40px_-12px_rgba(0,0,0,0.05)] dark:shadow-none overflow-hidden transition-all">
            <div className="flex items-center px-4 py-3 border-b border-zinc-200/80 dark:border-white/[0.05] bg-zinc-50 dark:bg-white/[0.02]">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700"></div>
              </div>
            </div>
            <div className="p-5 font-mono text-xs leading-relaxed overflow-x-auto text-zinc-600 dark:text-zinc-400">
              <div className="text-zinc-400 dark:text-zinc-600 mb-1"># Example Agent Prompt</div>
              <div className="text-blue-600 dark:text-blue-400 mb-4">"I flew on AF7303 on July 16, 2026. The flight was delayed by 4 hours. Can you check my compensation eligibility?"</div>
              
              <div className="text-zinc-400 dark:text-zinc-600 mb-1"># Agent Execution Process</div>
              <div className="text-purple-600 dark:text-purple-400 mb-1">1. Extracts your flight telemetry and searches historical disruption logs.</div>
              <div className="text-purple-600 dark:text-purple-400 mb-1">2. Cross-references flight data against published EU261 regulatory guidelines.</div>
              <div className="text-purple-600 dark:text-purple-400 mb-4">3. Calculates an estimated compensation tier based on distance and delay duration.</div>
              
              <div className="text-zinc-400 dark:text-zinc-600 mb-1"># Expected Output</div>
              <div className="text-emerald-600 dark:text-emerald-400 mb-4">The agent returns an estimated eligibility assessment, a factual summary of the relevant regulations, and an email template you can use to contact the airline.</div>
              
              <div className="mt-2 mb-6 p-4 rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
                <div className="text-zinc-800 dark:text-zinc-200 font-semibold mb-2">Agent Verdict: Eligible for €250</div>
                <div className="text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">
{`Based on live telemetry, flight RYR557 was delayed by 4 hours. Because the flight departed from the UK/EU and the distance is under 1,500 km, you are estimated to be eligible for €250 under EU261.

**Drafted Email Template:**
Subject: Claim for Compensation under EU Regulation 261/2004 - Flight RYR557

To: Ryanair Customer Service

Dear Ryanair,
I am writing to formally request compensation under EU Regulation 261/2004 for the disruption of my flight.

Flight Number: RYR557
My flight was delayed by 4 hours upon arrival at my final destination. As the flight distance is under 1,500 km, I am entitled to compensation in the amount of €250.

I look forward to your prompt response.`}
                </div>
              </div>
              
              <div className="text-zinc-500/80 dark:text-zinc-500/80 text-[10px] uppercase tracking-wider mb-1">Important Disclaimer</div>
              <div className="text-zinc-500 dark:text-zinc-500">The agent is an informational tool, not a legal entity. Its outputs do not constitute legal advice and cannot guarantee compensation. We strongly advise consulting with a lawyer or legal professional before requesting a refund or filing a claim.</div>
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg border border-zinc-200 dark:border-white/[0.1] bg-white dark:bg-[#0a0a0a] text-zinc-700 dark:text-zinc-300 shadow-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
            </div>
            <h2 className="text-xl font-medium text-zinc-900 dark:text-zinc-100 tracking-tight">Required Information</h2>
          </div>
          
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6 leading-relaxed max-w-2xl">
            To ensure the deterministic rules engine can accurately process your claim, make sure to provide the agent with the following details in your prompt:
          </p>

          <div className="rounded-2xl border border-zinc-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0a0a0a] shadow-[0_2px_40px_-12px_rgba(0,0,0,0.05)] dark:shadow-none p-5 font-mono text-xs text-zinc-800 dark:text-zinc-200 mb-8 overflow-x-auto transition-all">
            <ul className="space-y-4">
              <li className="flex flex-col sm:flex-row gap-2 sm:gap-4 border-b border-zinc-100 dark:border-white/5 pb-3 last:border-0 last:pb-0">
                <span className="text-zinc-500 w-32 shrink-0 font-semibold">Flight Number:</span>
                <span className="text-zinc-600 dark:text-zinc-400">The standard IATA flight number (e.g., AF7303, BA12).</span>
              </li>
              <li className="flex flex-col sm:flex-row gap-2 sm:gap-4 border-b border-zinc-100 dark:border-white/5 pb-3 last:border-0 last:pb-0">
                <span className="text-zinc-500 w-32 shrink-0 font-semibold">Flight Date:</span>
                <span className="text-zinc-600 dark:text-zinc-400">The date the flight was scheduled to depart.</span>
              </li>
            </ul>
            <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-white/10 text-emerald-600 dark:text-emerald-400">
              <span className="font-semibold">Note:</span> You may optionally provide the issue type or delay duration in your prompt. However, the agent will always independently fetch real-time telemetry from AviationStack to verify your claim and definitively prove the true delay or cancellation duration.
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
