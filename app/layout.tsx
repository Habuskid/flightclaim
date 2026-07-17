import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FlightClaim',
  description: 'EU261 Flight Compensation via OKX.AI',
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fafafa' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const okxListingUrl = process.env.NEXT_PUBLIC_OKX_MARKETPLACE_URL || '#';

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="antialiased min-h-screen flex flex-col font-sans selection:bg-zinc-200 dark:selection:bg-zinc-800 selection:text-black dark:selection:text-white transition-colors duration-300 relative text-zinc-800 dark:text-zinc-200">
        
        {/* Global Premium Dotted Background (visible on all pages except Landing which covers it) */}
        <div className="fixed inset-0 -z-20 h-full w-full bg-[#FAFAFA] dark:bg-[#0a0a0a] bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:24px_24px]"></div>
        <div className="fixed inset-0 -z-20 h-full w-full bg-gradient-to-b from-transparent via-transparent to-[#FAFAFA] dark:to-[#0a0a0a] pointer-events-none"></div>

        {/* Top Navigation */}
        <header className="sticky top-0 z-50 w-full border-b border-zinc-200/80 dark:border-white/[0.08] bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md transition-colors duration-300">
          <div className="mx-auto max-w-6xl px-6">
            <div className="flex min-h-16 py-3 sm:py-0 items-center justify-between">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <a href="/" className="flex items-center gap-2 group">
                  <img src="/icons/logo.png" alt="FlightClaim Logo" className="h-6 w-6 rounded-[4px] border border-zinc-200 dark:border-white/[0.1] object-cover bg-white dark:bg-[#0a0a0a]" />
                  <span className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 transition-colors">FlightClaim</span>
                </a>
              </div>
              
              {/* Mobile CTA (Visible only on mobile, right aligned with Logo) */}
              <div className="flex sm:hidden items-center">
                <a
                  href={okxListingUrl}
                  className="inline-flex items-center justify-center rounded-full bg-zinc-900 dark:bg-white px-4 py-1.5 text-xs font-medium text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-sm dark:shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                >
                  Launch
                </a>
              </div>
              
              {/* Nav Links (Desktop Only) */}
              <nav className="hidden sm:flex items-center gap-8 text-sm font-medium">
                <a href="/how-it-works" className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors whitespace-nowrap">Architecture</a>
                <a href="/docs" className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors whitespace-nowrap">Docs</a>
                <a href="/pricing-and-rules" className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors whitespace-nowrap">Pricing & Rules</a>
              </nav>
              
              {/* Desktop CTA */}
              <div className="hidden sm:block">
                <a
                  href={okxListingUrl}
                  className="inline-flex items-center justify-center rounded-full bg-zinc-900 dark:bg-white px-4 py-1.5 text-sm font-medium text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-sm dark:shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                >
                  Launch on OKX.AI
                </a>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col relative w-full">
          <div className="relative z-10 flex-1 w-full mx-auto max-w-6xl px-6">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-zinc-200/80 dark:border-white/[0.08] bg-white/50 dark:bg-[#0a0a0a]/50 backdrop-blur-md pt-6 pb-28 sm:pb-6 mt-12 transition-colors duration-300">
          <div className="mx-auto max-w-6xl px-6 flex flex-col items-center md:items-end justify-center">
            <p className="text-xs text-zinc-500 max-w-md text-center md:text-right leading-relaxed">
              &copy; 2026 FlightClaim. Secure deterministic evaluations based on encrypted flight telemetry. This does not constitute legal advice. Verify with an enforcement body before submitting a formal claim.
            </p>
          </div>
        </footer>

        {process.env.NODE_ENV === 'production' && <Analytics />}

        {/* Floating Mobile Bottom Navigation */}
        <div className="sm:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-[360px] bg-zinc-900/90 dark:bg-[#111111]/90 backdrop-blur-xl border border-white/10 rounded-full p-1.5 flex justify-between items-center shadow-2xl pb-safe">
          <a href="/" className="flex-1 text-center py-2.5 text-[11px] font-medium text-zinc-400 hover:text-white transition-colors">Home</a>
          <a href="/how-it-works" className="flex-1 text-center py-2.5 text-[11px] font-medium text-zinc-400 hover:text-white transition-colors">Architecture</a>
          <a href="/docs" className="flex-1 text-center py-2.5 text-[11px] font-medium text-zinc-400 hover:text-white transition-colors">Docs</a>
          <a href="/pricing-and-rules" className="flex-1 text-center py-2.5 text-[11px] font-medium text-zinc-400 hover:text-white transition-colors">Pricing</a>
        </div>
      </body>
    </html>
  )
}
