export default function Page() {
  const okxListingUrl = process.env.NEXT_PUBLIC_OKX_MARKETPLACE_URL || '#';

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-4 text-center">
      {/* Background Image without overlays */}
      <div className="absolute inset-0 -z-10 w-[100vw] left-1/2 -translate-x-1/2">
        <img src="/icons/bg-hero.jpg" alt="" className="w-full h-full object-cover" />
      </div>

      {/* Hero Section */}
      <div className="max-w-4xl flex flex-col items-center pb-20">
        <a 
          href={okxListingUrl}
          className="group inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 backdrop-blur-md px-3 py-1 text-xs font-medium text-zinc-900 dark:text-white transition-colors hover:bg-white/20 mb-8 shadow-lg"
        >
          Now live on OKX.AI Agent Marketplace
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </a>
        
        <h1 className="text-5xl md:text-7xl font-semibold tracking-tighter text-white [text-shadow:_0_4px_32px_rgb(0_0_0_/_100%),_0_2px_8px_rgb(0_0_0_/_100%)] mb-4 leading-[1.1]">
          Automated EU261 <br /> Flight Compensation
        </h1>
        
        <p className="mx-auto max-w-2xl text-lg md:text-xl text-white [text-shadow:_0_4px_24px_rgb(0_0_0_/_100%),_0_2px_4px_rgb(0_0_0_/_100%)] leading-relaxed font-medium tracking-tight mb-12">
          An Agent Service Provider that processes real-time aviation data through a deterministic rules engine to evaluate eligibility and draft formal claim letters.
        </p>
      </div>
    </div>
  );
}
