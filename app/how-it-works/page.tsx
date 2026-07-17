export default function HowItWorksPage() {
  return (
    <div className="py-24 max-w-4xl mx-auto min-h-screen">
      <div className="mb-20">
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 mb-4">Architecture</h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">The FlightClaim pipeline</p>
      </div>

      <div className="space-y-12 relative before:absolute before:inset-0 before:ml-[27px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-px before:bg-zinc-200 dark:before:bg-zinc-800 z-10">
        
        {/* Step 1 */}
        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
          <div className="flex items-center justify-center w-14 h-14 rounded-full border border-zinc-200 dark:border-white/[0.1] bg-white dark:bg-[#0a0a0a] text-zinc-700 dark:text-zinc-300 shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
          </div>
          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-2xl border border-zinc-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0a0a0a] shadow-[0_2px_40px_-12px_rgba(0,0,0,0.05)] dark:shadow-none transition-all">
            <div className="text-xs font-medium text-zinc-500 uppercase mb-2">Phase 1</div>
            <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">Flight Telemetry Ingestion</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">
              The agent securely connects to global aviation databases to retrieve accurate historical flight data, routing parameters, and real-time disruption logs.
            </p>
            <div className="rounded-lg bg-zinc-50 dark:bg-zinc-900 p-3 border border-zinc-100 dark:border-zinc-800 overflow-x-auto">
              <code className="text-xs text-zinc-800 dark:text-zinc-200 font-mono">
                <span className="text-blue-600 dark:text-blue-400">GET</span> /api/telemetry/v1/flights
              </code>
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
          <div className="flex items-center justify-center w-14 h-14 rounded-full border border-zinc-200 dark:border-white/[0.1] bg-white dark:bg-[#0a0a0a] text-zinc-700 dark:text-zinc-300 shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
          </div>
          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-2xl border border-zinc-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0a0a0a] shadow-[0_2px_40px_-12px_rgba(0,0,0,0.05)] dark:shadow-none transition-all">
            <div className="text-xs font-medium text-zinc-500 uppercase mb-2">Phase 2</div>
            <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">Deterministic EU261 Engine</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Our deterministic engine calculates great-circle flight distances using the Haversine formula and cross-references flight parameters against EU261 rules to estimate eligibility and calculate potential compensation tiers (€250/€400/€600).
            </p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
          <div className="flex items-center justify-center w-14 h-14 rounded-full border border-zinc-200 dark:border-white/[0.1] bg-white dark:bg-[#0a0a0a] text-zinc-700 dark:text-zinc-300 shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-2xl border border-zinc-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0a0a0a] shadow-[0_2px_40px_-12px_rgba(0,0,0,0.05)] dark:shadow-none transition-all">
            <div className="text-xs font-medium text-zinc-500 uppercase mb-2">Phase 3</div>
            <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">Secure LLM Inference</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Upon establishing estimated eligibility, the agent delegates to a secure, distributed AI inference network via RPC to generate a personalized explanation and a drafted email template for you to review and send to the airline.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
