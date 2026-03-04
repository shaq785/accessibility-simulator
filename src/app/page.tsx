import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="space-y-4">
          <div className="w-16 h-16 mx-auto bg-blue-500 rounded-2xl flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white">Accessibility Simulator</h1>
          <p className="text-slate-300 text-lg">
            Experience web content through different accessibility lenses.
            Understand how users with visual, motor, or cognitive differences interact with your designs.
          </p>
        </div>

        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href="/simulator"
            className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold px-8 py-4 rounded-xl transition-colors text-lg"
          >
            Launch Simulator
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <Link
            href="/aeo"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 py-4 rounded-xl transition-colors text-lg"
          >
            AEO Scanner
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </Link>
          <Link
            href="/career-day"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-8 py-4 rounded-xl transition-colors text-lg"
          >
            Career Day (Kids)
            <span aria-hidden="true">👋</span>
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4">
          <div className="bg-slate-800/50 rounded-lg p-4 text-left">
            <div className="text-lg mb-1">👁️</div>
            <h3 className="text-white font-medium mb-1">Lens Simulator</h3>
            <p className="text-slate-400 text-sm">Blur, contrast, color blindness, reduced motion</p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4 text-left">
            <div className="text-lg mb-1">🔍</div>
            <h3 className="text-white font-medium mb-1">Site Analysis</h3>
            <p className="text-slate-400 text-sm">Paste any URL for quick accessibility audit</p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4 text-left">
            <div className="text-lg mb-1">📡</div>
            <h3 className="text-white font-medium mb-1">AEO Scanner</h3>
            <p className="text-slate-400 text-sm">Quick signals for answer engine optimization</p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4 text-left">
            <div className="text-lg mb-1">📖</div>
            <h3 className="text-white font-medium mb-1">Reading Aids</h3>
            <p className="text-slate-400 text-sm">Typography scaling & focus tools</p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4 text-left">
            <div className="text-lg mb-1">📋</div>
            <h3 className="text-white font-medium mb-1">Audit Report</h3>
            <p className="text-slate-400 text-sm">Images, labels, headings, buttons, links</p>
          </div>
        </div>
      </div>
    </main>
  );
}
