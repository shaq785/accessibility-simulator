"use client";

import { useState } from "react";
import Link from "next/link";
import { ColorBlindnessFilters } from "@/components/ColorBlindnessFilters";
import {
  BeforeAfterCard,
  MockWebsiteCard,
  CodepenMock,
  ScreenshotGrid,
  IconRow,
} from "@/components/career";
import type { ScreenshotItem, IconItem } from "@/components/career";
import type { LensState } from "@/lib/types";

// ─── Slide order (easy to reorder) ─────────────────────────────────────────
const SLIDES = [
  "intro",
  "what-is-website",
  "design",
  "code",
  "accessibility",
  "your-turn",
  "real-websites",
  "closing",
] as const;

type SlideId = (typeof SLIDES)[number];

// ─── Real websites: images in /public/career/images/ ────────────────────────
const REAL_WEBSITE_SCREENSHOTS: ScreenshotItem[] = [
  {
    src: "/career/images/muffin_logo.png",
    label: "Little Bites",
    url: "https://www.littlebites.com/",
  },
  {
    src: "/career/images/thomas-logo.png",
    label: "Thomas' English Muffins",
    url: "https://thomasbreads.com/",
  },
  {
    src: "/career/images/takis-logo.png",
    label: "Takis",
    url: "https://takis.ca/",
  },
];

// ─── Accessibility icon row ─────────────────────────────────────────────────
const ACCESSIBILITY_ICONS: IconItem[] = [
  { emoji: "👓", label: "Needs bigger text" },
  { emoji: "🎧", label: "Computer reads out loud" },
  { emoji: "⌨️", label: "Uses keyboard" },
  { emoji: "🎨", label: "Sees colors differently" },
];

// ─── Lens helpers (for accessibility demo) ──────────────────────────────────
function getLensClasses(lensState: Partial<LensState>): string {
  if (lensState.tabHighlight) return "tab-highlight-active";
  return "";
}

function getFilterStyle(lensState: Partial<LensState>): React.CSSProperties {
  const filters: string[] = [];
  if (lensState.blur === "blur-mild") filters.push("blur(2px)");
  if (lensState.blur === "blur-moderate") filters.push("blur(4px)");
  if (lensState.blur === "blur-severe") filters.push("blur(6px)");
  if (lensState.colorVision === "protanopia") filters.push("url(#protanopia)");
  if (lensState.colorVision === "deuteranopia") filters.push("url(#deuteranopia)");
  if (lensState.colorVision === "tritanopia") filters.push("url(#tritanopia)");
  return filters.length > 0 ? { filter: filters.join(" ") } : {};
}

export default function CareerDayPage() {
  return (
    <div className="h-screen overflow-y-auto overflow-x-hidden snap-y snap-mandatory scroll-smooth bg-linear-to-b from-amber-50 to-orange-50">
      <ColorBlindnessFilters />
      {SLIDES.map((id) => (
        <Slide key={id} id={id} />
      ))}
    </div>
  );
}

function Slide({ id }: { id: SlideId }) {
  switch (id) {
    case "intro":
      return <IntroSlide />;
    case "what-is-website":
      return <WhatIsWebsiteSlide />;
    case "design":
      return <DesignSlide />;
    case "code":
      return <CodeSlide />;
    case "accessibility":
      return <AccessibilitySlide />;
    case "real-websites":
      return <RealWebsitesSlide />;
    case "your-turn":
      return <YourTurnSlide />;
    case "closing":
      return <ClosingSlide />;
    default:
      return null;
  }
}

function IntroSlide() {
  return (
    <section
      className="min-h-screen w-full flex flex-col items-center justify-center snap-start px-6 py-12"
      aria-labelledby="intro-heading"
    >
      <h1
        id="intro-heading"
        className="text-4xl sm:text-5xl md:text-6xl font-bold text-center text-slate-800 mb-4"
      >
        Hi! I Build Websites.
      </h1>
      <p className="text-2xl sm:text-3xl text-slate-600 text-center max-w-xl">
        And I make sure everyone can use them.
      </p>
    </section>
  );
}

function WhatIsWebsiteSlide() {
  return (
    <section
      className="min-h-screen w-full flex flex-col items-center justify-center snap-start px-6 py-12"
      aria-labelledby="what-website-heading"
    >
      <h2
        id="what-website-heading"
        className="text-3xl sm:text-4xl font-bold text-slate-800 mb-6 text-center"
      >
        What Is a Website?
      </h2>
      <MockWebsiteCard />
      <p className="mt-8 text-xl sm:text-2xl font-semibold text-slate-700 text-center">
        A website can help you:
      </p>
      <p className="mt-2 flex flex-wrap justify-center gap-3 text-xl sm:text-2xl font-bold text-slate-800" role="list" aria-label="Look, Click, Learn, Buy">
        <span role="listitem">Look</span>
        <span aria-hidden="true">•</span>
        <span role="listitem">Click</span>
        <span aria-hidden="true">•</span>
        <span role="listitem">Learn</span>
        <span aria-hidden="true">•</span>
        <span role="listitem">Buy</span>
      </p>
      <p className="mt-4 text-lg text-slate-500 text-center max-w-md">
        Websites are like digital playgrounds.
      </p>
    </section>
  );
}

function DesignSlide() {
  return (
    <section
      className="min-h-screen w-full flex flex-col items-center justify-center snap-start px-6 py-12"
      aria-labelledby="design-heading"
    >
      <h2
        id="design-heading"
        className="text-3xl sm:text-4xl font-bold text-slate-800 mb-6 text-center"
      >
        Same Website, Two Designs
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mb-6">
        <BeforeAfterCard label="Messy Design" variant="before">
          <div className="text-left w-full space-y-2">
            <p className="text-xs text-amber-900 opacity-80">
              tiny hard-to-read text
            </p>
            <p className="text-xs text-amber-900 opacity-80">
              everything squished together
            </p>
            <p className="text-xs text-amber-900 opacity-70">
              dull gray button
            </p>
            <button
              type="button"
              className="mt-2 px-3 py-1.5 text-xs bg-amber-200 text-amber-900 rounded"
              tabIndex={-1}
              aria-hidden
            >
              Button
            </button>
          </div>
        </BeforeAfterCard>
        <BeforeAfterCard label="Good Design" variant="after">
          <div className="text-left w-full space-y-3">
            <p className="text-lg font-bold text-green-900">
              Clear headings
            </p>
            <p className="text-base text-green-800">
              Nice spacing. Easy to read.
            </p>
            <button
              type="button"
              className="px-5 py-2.5 text-base font-bold bg-green-500 text-white rounded-xl"
              tabIndex={-1}
              aria-hidden
            >
              Friendly button
            </button>
          </div>
        </BeforeAfterCard>
      </div>
      <p className="text-2xl font-bold text-slate-800 text-center">
        Design is how it looks and feels.
      </p>
    </section>
  );
}

function CodeSlide() {
  return (
    <section
      className="min-h-screen w-full flex flex-col items-center justify-center snap-start px-6 py-12"
      aria-labelledby="code-heading"
    >
      <h2
        id="code-heading"
        className="text-3xl sm:text-4xl font-bold text-slate-800 mb-6 text-center"
      >
        Code → Result
      </h2>
      <CodepenMock />
      <p className="mt-8 text-xl sm:text-2xl text-slate-700 text-center max-w-xl">
        Code is the instructions we give the computer.
      </p>
    </section>
  );
}

function AccessibilitySlide() {
  const [blur, setBlur] = useState<string | null>(null);
  const [colorVision, setColorVision] = useState<string | null>(null);
  const [tabHighlight, setTabHighlight] = useState(false);
  const lensState = { blur, colorVision, tabHighlight };

  const toggleBlur = () =>
    setBlur((b) =>
      b === null ? "blur-mild" : b === "blur-mild" ? "blur-moderate" : b === "blur-moderate" ? "blur-severe" : null
    );
  const toggleColor = () =>
    setColorVision((c) =>
      c === null ? "deuteranopia" : c === "deuteranopia" ? "protanopia" : c === "protanopia" ? "tritanopia" : null
    );

  return (
    <section
      className="min-h-screen w-full flex flex-col items-center justify-center snap-start px-6 py-12"
      aria-labelledby="accessibility-heading"
    >
      <h2
        id="accessibility-heading"
        className="text-3xl sm:text-4xl font-bold text-slate-800 mb-6 text-center"
      >
        We Make Websites Work for Everyone
      </h2>
      <IconRow items={ACCESSIBILITY_ICONS} className="mb-8" />
      <div className="flex flex-wrap justify-center gap-3 mb-6">
        <button
          type="button"
          onClick={toggleBlur}
          className={`px-5 py-3 rounded-2xl font-bold text-lg focus:outline-none focus:ring-4 focus:ring-amber-300 ${
            blur ? "bg-amber-500 text-white" : "bg-slate-200 text-slate-800 hover:bg-slate-300"
          }`}
        >
          Blurry Vision
        </button>
        <button
          type="button"
          onClick={toggleColor}
          className={`px-5 py-3 rounded-2xl font-bold text-lg focus:outline-none focus:ring-4 focus:ring-amber-300 ${
            colorVision ? "bg-amber-500 text-white" : "bg-slate-200 text-slate-800 hover:bg-slate-300"
          }`}
        >
          Different Colors
        </button>
        
      </div>
      <div
        className={`rounded-2xl border-4 border-amber-200 bg-white p-6 max-w-md w-full ${getLensClasses(lensState)}`}
        style={getFilterStyle(lensState)}
      >
        <p className="text-lg font-medium text-slate-800">Preview</p>
        <button
          type="button"
          className="mt-3 px-4 py-2 bg-indigo-500 text-white rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          I am a button
        </button>
      </div>
      <p className="mt-6 text-xl text-slate-700 text-center max-w-lg">
        We make websites work for everyone.
      </p>
    </section>
  );
}

function RealWebsitesSlide() {
  return (
    <section
      className="min-h-screen w-full flex flex-col items-center justify-center snap-start px-6 py-12"
      aria-labelledby="real-websites-heading"
    >
      <h2
        id="real-websites-heading"
        className="text-3xl sm:text-4xl font-bold text-slate-800 mb-6 text-center"
      >
        Real Websites I Helped Build
      </h2>
      <ScreenshotGrid items={REAL_WEBSITE_SCREENSHOTS} />
      <p className="mt-8 text-xl text-slate-600 text-center max-w-md">
        I build pages like these for real companies.
      </p>
    </section>
  );
}

function YourTurnSlide() {
  const [bigText, setBigText] = useState(false);
  const [showFocus, setShowFocus] = useState(false);

  return (
    <section
      className="min-h-screen w-full flex flex-col items-center justify-center snap-start px-6 py-12"
      aria-labelledby="your-turn-heading"
    >
      <h2
        id="your-turn-heading"
        className="text-3xl sm:text-4xl font-bold text-slate-800 mb-6 text-center"
      >
        Quick Demo
      </h2>
      <div className="flex flex-wrap justify-center gap-10 mb-6">
        <div className="flex flex-col items-center">
          <button
            type="button"
            onClick={() => setBigText(!bigText)}
            className="px-6 py-4 rounded-2xl font-bold bg-green-500 text-white hover:bg-green-600 focus:outline-none focus:ring-4 focus:ring-green-300 text-lg"
          >
            Text size: {bigText ? "Big" : "Small"} → {bigText ? "Small" : "Big"}
          </button>
          <p
            className={`mt-4 font-medium text-slate-800 transition-all duration-300 ${
              bigText ? "text-4xl" : "text-xl"
            }`}
          >
            Hello, friends!
          </p>
        </div>
        <div className="flex flex-col items-center">
          <button
            type="button"
            onClick={() => setShowFocus(!showFocus)}
            className="px-6 py-4 rounded-2xl font-bold bg-teal-500 text-white hover:bg-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-300 text-lg"
          >
            Keyboard focus ring
          </button>
          <div
            className={`mt-4 p-4 rounded-xl border-2 ${
              showFocus ? "tab-highlight-active border-teal-300" : "border-slate-200"
            }`}
          >
            <button
              type="button"
              className="px-5 py-2 bg-teal-400 text-white rounded-lg font-medium"
            >
              Sample button
            </button>
          </div>
        </div>
      </div>
      <p className="text-xl text-slate-700 text-center max-w-lg">
        This helps people read and navigate.
      </p>
    </section>
  );
}

function ClosingSlide() {
  return (
    <section
      className="min-h-screen w-full flex flex-col items-center justify-center snap-start px-6 py-12"
      aria-labelledby="closing-heading"
    >
      <h2
        id="closing-heading"
        className="text-4xl sm:text-5xl md:text-6xl font-bold text-center text-slate-800 mb-6"
      >
        I Build. I Solve. I Help.
      </h2>
      <p className="text-2xl sm:text-3xl text-slate-600 text-center mb-8 flex flex-wrap justify-center gap-3">
        <span role="img" aria-hidden="true">🛠️</span>
        <span role="img" aria-hidden="true">💡</span>
        <span role="img" aria-hidden="true">❤️</span>
      </p>
    </section>
  );
}
