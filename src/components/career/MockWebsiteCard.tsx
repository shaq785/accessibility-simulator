"use client";

import { useState } from "react";

/**
 * Pizza Place – colorful mock website for "What is a Website?" slide.
 * Shows: logo, hero (pizza), nav buttons, big Order button.
 * Buttons give visual feedback when clicked (presenter demo).
 */
export function MockWebsiteCard() {
  const [lastClicked, setLastClicked] = useState<string | null>(null);

  const navButtons = [
    { id: "menu", label: "Menu" },
    { id: "locations", label: "Locations" },
    { id: "contact", label: "Contact" },
  ];

  const clickLabels: Record<string, string> = {
    menu: "Menu",
    locations: "Locations",
    contact: "Contact",
    order: "Order",
  };

  const handleClick = (id: string) => {
    setLastClicked(id);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border-4 border-orange-200 overflow-hidden max-w-md w-full">
      {/* Header / logo */}
      <div className="bg-orange-500 px-4 py-3 flex items-center gap-2">
        <span className="text-3xl" aria-hidden="true">
          🍕
        </span>
        <span className="text-xl font-bold text-white">The Pizza Place</span>
      </div>
      {/* Hero image (pizza visual) */}
      <div className="bg-linear-to-b from-orange-100 to-amber-100 p-6 flex justify-center">
        <div
          className="w-32 h-32 rounded-full bg-amber-200 border-8 border-amber-400 flex items-center justify-center text-6xl"
          aria-hidden="true"
        >
          🍕
        </div>
      </div>
      {/* Nav buttons */}
      <div className="px-4 py-3 flex gap-2 flex-wrap">
        {navButtons.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => handleClick(id)}
            className="px-4 py-2 rounded-lg bg-slate-200 text-slate-700 font-medium text-sm hover:bg-slate-300 active:scale-95 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-transform"
          >
            {label}
          </button>
        ))}
      </div>
      {/* Big CTA */}
      <div className="p-4">
        <button
          type="button"
          onClick={() => handleClick("order")}
          className="w-full py-4 rounded-xl font-bold text-xl bg-orange-500 text-white hover:bg-orange-600 active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-orange-300 transition-transform"
        >
          Order
        </button>
      </div>
      {/* Click feedback for presenter */}
      {lastClicked && (
        <div
          className="px-4 py-2 bg-amber-100 border-t-2 border-amber-200 text-center text-sm font-medium text-amber-900"
          role="status"
          aria-live="polite"
        >
          You clicked {lastClicked ? clickLabels[lastClicked] : ""}!
        </div>
      )}
    </div>
  );
}
