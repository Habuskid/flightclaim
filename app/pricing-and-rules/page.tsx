export default function PricingAndRulesPage() {
  const x402Price = process.env.X402_PRICE || '0.10';

  return (
    <div className="py-24 max-w-4xl mx-auto min-h-screen">
      <div className="mb-20">
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 mb-4">Rules & Pricing</h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">Operational parameters and agent usage costs.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
        
        {/* Rules Card */}
        <div className="rounded-3xl border border-zinc-200/50 dark:border-white/10 bg-white/40 dark:bg-black/20 backdrop-blur-xl shadow-xl p-8 transition-all">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg border border-zinc-200 dark:border-white/[0.1] bg-zinc-50 dark:bg-white/[0.03] text-zinc-700 dark:text-zinc-300 shadow-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            </div>
            <h2 className="text-xl font-medium text-zinc-900 dark:text-zinc-100 tracking-tight">EU261 Parameters</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-zinc-800 dark:text-zinc-200 mb-1">Jurisdiction Check</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Applies only to flights departing from an EU/EEA airport, or flights arriving at an EU/EEA airport operated by an EU/EEA airline.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-zinc-800 dark:text-zinc-200 mb-1">Delay Triggers</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Eligibility triggers if the flight arrives at the final destination with a delay of 3 hours or more.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-zinc-800 dark:text-zinc-200 mb-1">Cancellation Triggers</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Eligibility triggers if the flight is cancelled within 14 days of departure without adequate rerouting.
              </p>
            </div>
            <div className="pt-6 border-t border-zinc-200 dark:border-white/[0.05]">
              <p className="text-xs text-zinc-500 leading-relaxed">
                <span className="text-zinc-600 dark:text-zinc-400 font-medium">Disclaimer:</span> The Agent outputs automated estimates derived from historical aviation data. This is not legal advice. We strongly advise consulting with a lawyer or legal professional before requesting a refund or filing a claim. Extraordinary circumstances (e.g., weather) invalidate claims.
              </p>
            </div>
          </div>
        </div>

        {/* Pricing Card */}
        <div className="rounded-3xl border border-zinc-200/50 dark:border-white/10 bg-white/40 dark:bg-black/20 backdrop-blur-xl shadow-xl p-8 flex flex-col transition-all">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg border border-zinc-200 dark:border-white/[0.1] bg-zinc-50 dark:bg-white/[0.03] text-zinc-700 dark:text-zinc-300 shadow-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
            </div>
            <h2 className="text-xl font-medium text-zinc-900 dark:text-zinc-100 tracking-tight">Agent Pricing</h2>
          </div>
          
          <div className="flex-1 flex flex-col justify-center py-8">
            <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-3">PER-CLAIM COST</div>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-5xl font-semibold tracking-tighter text-zinc-900 dark:text-white">${x402Price}</span>
              <span className="text-sm text-zinc-500 font-medium">USD</span>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-8">
              Payable seamlessly via your OKX Wallet using the x402 protocol. You only pay when the agent successfully generates a claim.
            </p>
            
            <ul className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
              <li className="flex items-center gap-3">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-zinc-400 dark:text-zinc-600" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                No monthly subscriptions
              </li>
              <li className="flex items-center gap-3">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-zinc-400 dark:text-zinc-600" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Real-time data included
              </li>
              <li className="flex items-center gap-3">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-zinc-400 dark:text-zinc-600" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Drafted claim letter included
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
