"use client";

import { useState, useMemo } from "react";
import { LensControls } from "@/components/LensControls";
import { FindingsPanel } from "@/components/FindingsPanel";
import { ReadingRuler } from "@/components/ReadingRuler";
import { ColorBlindnessFilters } from "@/components/ColorBlindnessFilters";
import { SiteAnalyzer } from "@/components/SiteAnalyzer";
import { LensState, defaultLensState } from "@/lib/types";
import { getActiveFindings } from "@/lib/findings";
import Link from "next/link";

type DemoPage = "good" | "bad";
type Mode = "demo" | "analyze";

export default function SimulatorPage() {
  const [mode, setMode] = useState<Mode>("demo");
  const [lensState, setLensState] = useState<LensState>(defaultLensState);
  const [activePage, setActivePage] = useState<DemoPage>("good");
  const [controlsExpanded, setControlsExpanded] = useState(false);
  const [findingsExpanded, setFindingsExpanded] = useState(false);

  const handleLensChange = (newState: Partial<LensState>) => {
    setLensState((prev) => ({ ...prev, ...newState }));
  };

  const findings = useMemo(() => getActiveFindings(lensState, activePage), [lensState, activePage]);

  const getLensClasses = () => {
    const classes: string[] = [];
    if (lensState.reducedMotion) classes.push("lens-reduced-motion");
    if (lensState.fontScale) classes.push(`lens-${lensState.fontScale}`);
    if (lensState.lineHeight) classes.push(`lens-${lensState.lineHeight}`);
    if (lensState.tabHighlight) classes.push("tab-highlight-active");
    return classes.join(" ");
  };

  const getFilterStyle = () => {
    const filters: string[] = [];
    
    if (lensState.blur === "blur-mild") filters.push("blur(1px)");
    if (lensState.blur === "blur-moderate") filters.push("blur(2px)");
    if (lensState.blur === "blur-severe") filters.push("blur(3px)");
    
    if (lensState.contrast === "contrast-low") filters.push("contrast(0.6)");
    if (lensState.contrast === "contrast-high") filters.push("contrast(1.5)");
    
    if (lensState.colorVision === "protanopia") filters.push("url(#protanopia)");
    if (lensState.colorVision === "deuteranopia") filters.push("url(#deuteranopia)");
    if (lensState.colorVision === "tritanopia") filters.push("url(#tritanopia)");
    
    return filters.length > 0 ? { filter: filters.join(" ") } : {};
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <ColorBlindnessFilters />
      <ReadingRuler enabled={lensState.readingRuler} />

      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-white">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <span className="font-semibold hidden sm:inline">Accessibility Simulator</span>
          </Link>

          {/* Toggles */}
          <div className="flex items-center gap-3">
            {/* Demo page toggle - only show in demo mode */}
            {mode === "demo" && (
              <div className="flex items-center gap-1 bg-slate-700 rounded-lg p-1">
                <button
                  onClick={() => setActivePage("good")}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${activePage === "good" ? "bg-green-600 text-white" : "text-slate-300 hover:text-white"}`}
                >
                  <span className="hidden sm:inline">Good </span>Demo
                </button>
                <button
                  onClick={() => setActivePage("bad")}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${activePage === "bad" ? "bg-red-600 text-white" : "text-slate-300 hover:text-white"}`}
                >
                  <span className="hidden sm:inline">Bad </span>Demo
                </button>
              </div>
            )}

            {/* Mode Toggle */}
            <div className="flex items-center gap-1 bg-slate-700 rounded-lg p-1">
              <button
                onClick={() => setMode("demo")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${mode === "demo" ? "bg-indigo-600 text-white" : "text-slate-300 hover:text-white"}`}
              >
                <span className="hidden sm:inline">Lens </span>Demo
              </button>
              <button
                onClick={() => setMode("analyze")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${mode === "analyze" ? "bg-indigo-600 text-white" : "text-slate-300 hover:text-white"}`}
              >
                <span className="hidden sm:inline">Site </span>Analysis
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      {mode === "demo" ? (
        <div className="flex-1 flex flex-col md:flex-row md:items-start">
          <aside className="md:w-64 flex-shrink-0 md:order-first order-last md:sticky md:top-0 md:self-start">
            <LensControls lensState={lensState} onLensChange={handleLensChange} isExpanded={controlsExpanded} onToggleExpand={() => setControlsExpanded(!controlsExpanded)} />
          </aside>

          <main className="flex-1 flex flex-col min-w-0">
            <div className="bg-slate-700 px-4 py-2 text-sm text-slate-300 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${activePage === "good" ? "bg-green-500" : "bg-red-500"}`} />
              <span>Viewing: /simulator/demo/{activePage}</span>
            </div>
            <div className={`bg-white ${getLensClasses()}`} style={getFilterStyle()} role="region" aria-label="Demo page preview">
              {activePage === "good" ? <GoodDemoContent /> : <BadDemoContent />}
            </div>
          </main>

          <aside className="md:w-80 flex-shrink-0 md:sticky md:top-0 md:self-start">
            <FindingsPanel findings={findings} isExpanded={findingsExpanded} onToggleExpand={() => setFindingsExpanded(!findingsExpanded)} />
          </aside>
        </div>
      ) : (
        <div className="flex-1">
          <SiteAnalyzer />
        </div>
      )}
    </div>
  );
}

function GoodDemoContent() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <a href="#home" className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg p-1">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SC</span>
              </div>
              <span className="font-bold text-xl text-gray-900">ShopCraft</span>
            </a>
            <nav aria-label="Main navigation">
              <ul className="flex items-center gap-6">
                {["Products", "Sale", "About"].map((item) => (
                  <li key={item}>
                    <a href={`#${item.toLowerCase()}`} className="text-gray-700 hover:text-indigo-600 font-medium underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded px-2 py-1">
                      {item}
                    </a>
                  </li>
                ))}
                <li>
                  <button className="relative p-2 text-gray-700 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg" aria-label="Shopping cart, 3 items">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 text-white text-xs rounded-full flex items-center justify-center">3</span>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section aria-labelledby="hero-heading" className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <h1 id="hero-heading" className="text-4xl font-bold mb-4">Summer Collection 2026</h1>
          <p className="text-xl text-indigo-100 mb-6 max-w-xl">Discover our latest arrivals with up to 40% off. Quality products, free shipping on orders over $50.</p>
          <a href="#products" className="inline-flex items-center gap-2 bg-white text-indigo-600 font-semibold px-6 py-3 rounded-lg hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600 transition-colors">
            Shop Now
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </a>
        </div>
      </section>

      {/* Products */}
      <section aria-labelledby="products-heading" className="max-w-6xl mx-auto px-4 py-12">
        <h2 id="products-heading" className="text-2xl font-bold text-gray-900 mb-8">Featured Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { name: "Wireless Headphones", price: "$129", oldPrice: "$179", img: "🎧", tag: "Sale" },
            { name: "Smart Watch Pro", price: "$249", img: "⌚", tag: "New" },
            { name: "Leather Backpack", price: "$89", oldPrice: "$120", img: "🎒", tag: "Sale" },
          ].map((product) => (
            <article key={product.name} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="relative bg-gray-100 h-48 flex items-center justify-center text-6xl">
                {product.img}
                {product.tag && (
                  <span className={`absolute top-3 left-3 px-2 py-1 text-xs font-semibold rounded ${product.tag === "Sale" ? "bg-red-500 text-white" : "bg-indigo-500 text-white"}`}>
                    {product.tag}
                  </span>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2">{product.name}</h3>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg font-bold text-gray-900">{product.price}</span>
                  {product.oldPrice && <span className="text-sm text-gray-500 line-through">{product.oldPrice}</span>}
                </div>
                <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors">
                  Add to Cart
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section aria-labelledby="newsletter-heading" className="bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="max-w-xl">
            <h2 id="newsletter-heading" className="text-2xl font-bold mb-2">Stay in the loop</h2>
            <p className="text-gray-400 mb-6">Subscribe for exclusive offers, new arrivals, and 10% off your first order.</p>
            <form className="flex gap-3" onSubmit={(e) => e.preventDefault()}>
              <div className="flex-1">
                <label htmlFor="good-email" className="sr-only">Email address</label>
                <input type="email" id="good-email" placeholder="Enter your email" className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" required />
              </div>
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-600">© 2026 ShopCraft. All rights reserved.</p>
            <nav aria-label="Footer navigation">
              <ul className="flex gap-6">
                {["Privacy Policy", "Terms of Service", "Contact Us"].map((item) => (
                  <li key={item}>
                    <a href={`#${item.toLowerCase().replace(/ /g, "-")}`} className="text-gray-600 hover:text-indigo-600 underline focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}

function BadDemoContent() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - no semantic nav, poor contrast, no focus styles */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center animate-pulse-demo">
                <span className="text-white font-bold text-sm">SC</span>
              </div>
              <span className="font-bold text-xl text-gray-400">ShopCraft</span>
            </div>
            <div className="flex items-center gap-6">
              {[
                { text: "Products", tabIndex: 4 },
                { text: "Sale", tabIndex: 2 },
                { text: "About", tabIndex: 5 },
              ].map(({ text, tabIndex }) => (
                <span key={text} tabIndex={tabIndex} className="text-gray-400 cursor-pointer" style={{ outline: "none" }}>{text}</span>
              ))}
              <div className="relative p-2 cursor-pointer" tabIndex={1} style={{ outline: "none" }}>
                <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 text-white text-xs rounded-full flex items-center justify-center">3</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero - low contrast text, autoplay animation */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-4xl font-bold mb-4 text-indigo-300 animate-slide-demo">Summer Collection 2026</div>
          <p className="text-indigo-400 mb-6 max-w-xl" style={{ fontSize: "14px" }}>Discover our latest arrivals with up to 40% off. Quality products, free shipping on orders over $50.</p>
          <span className="inline-flex items-center gap-2 bg-white text-indigo-600 font-semibold px-6 py-3 rounded-lg cursor-pointer" tabIndex={3} style={{ outline: "none" }}>
            Shop Now
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </span>
        </div>
      </div>

      {/* Products - no headings, fixed height overflow, color-only status */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-gray-400 text-xl mb-8">Featured Products</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { name: "Wireless Headphones", price: "$129", oldPrice: "$179", img: "🎧", available: true },
            { name: "Smart Watch Pro", price: "$249", img: "⌚", available: true },
            { name: "Leather Backpack", price: "$89", oldPrice: "$120", img: "🎒", available: false },
          ].map((product) => (
            <div key={product.name} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden" style={{ height: "320px" }}>
              <div className="bg-gray-100 h-48 flex items-center justify-center text-6xl animate-pulse-demo">
                {product.img}
              </div>
              <div className="p-4">
                <div className="font-semibold text-gray-500 mb-2" style={{ fontSize: "14px" }}>{product.name}</div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg font-bold text-gray-500">{product.price}</span>
                  {product.oldPrice && <span className="text-sm text-gray-300 line-through">{product.oldPrice}</span>}
                </div>
                {/* Color-only availability indicator */}
                <span className={`text-sm ${product.available ? "text-green-500" : "text-red-500"}`}>
                  {product.available ? "● In Stock" : "● Out of Stock"}
                </span>
                <button className={`w-full mt-2 font-medium py-2 px-4 rounded-lg ${product.available ? "bg-green-500" : "bg-red-500"} text-white`} style={{ outline: "none" }} tabIndex={6}>
                  {product.available ? "Add to Cart" : "Notify Me"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Newsletter - no labels, low contrast */}
      <div className="bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="max-w-xl">
            <div className="text-xl text-gray-500 mb-2">Stay in the loop</div>
            <p className="text-gray-600 mb-6" style={{ fontSize: "12px" }}>Subscribe for exclusive offers, new arrivals, and 10% off your first order.</p>
            <form className="flex gap-3" onSubmit={(e) => e.preventDefault()}>
              <input type="text" placeholder="Enter your email" className="flex-1 px-4 py-3 rounded-lg bg-gray-800 border border-gray-800 text-white placeholder-gray-700" style={{ outline: "none", fontSize: "12px" }} />
              <button type="submit" className="bg-gray-700 text-gray-500 font-semibold px-6 py-3 rounded-lg" style={{ outline: "none" }}>
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Footer - no nav landmark, color-only links */}
      <div className="bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-300" style={{ fontSize: "11px" }}>© 2026 ShopCraft. All rights reserved.</p>
            <div className="flex gap-6">
              {["Privacy Policy", "Terms of Service", "Contact Us"].map((item) => (
                <span key={item} className="text-indigo-400 cursor-pointer" style={{ fontSize: "11px", outline: "none" }} tabIndex={7}>{item}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
