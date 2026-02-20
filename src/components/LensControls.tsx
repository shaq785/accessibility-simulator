"use client";

import { LensState } from "@/lib/types";

interface LensControlsProps {
  lensState: LensState;
  onLensChange: (newState: Partial<LensState>) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export function LensControls({ lensState, onLensChange, isExpanded, onToggleExpand }: LensControlsProps) {
  return (
    <div className="bg-slate-800 border-b border-slate-700 md:border-b-0 md:border-r">
      <button
        onClick={onToggleExpand}
        className="w-full px-4 py-3 flex items-center justify-between text-white md:hidden"
        aria-expanded={isExpanded}
      >
        <span className="font-medium">Lens Controls</span>
        <svg className={`w-5 h-5 transition-transform ${isExpanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div className={`${isExpanded ? "block" : "hidden"} md:block p-4 space-y-4 max-h-[60vh] overflow-auto md:max-h-none`}>
        {/* Vision */}
        <section>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Vision</h3>
          <div className="space-y-2">
            <label className="block">
              <span className="text-sm text-slate-300 mb-1 block">Blur</span>
              <select
                value={lensState.blur || ""}
                onChange={(e) => onLensChange({ blur: e.target.value || null })}
                className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="">None</option>
                <option value="blur-mild">Mild</option>
                <option value="blur-moderate">Moderate</option>
                <option value="blur-severe">Severe</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm text-slate-300 mb-1 block">Contrast</span>
              <select
                value={lensState.contrast || ""}
                onChange={(e) => onLensChange({ contrast: e.target.value || null })}
                className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Normal</option>
                <option value="contrast-low">Low Contrast</option>
                <option value="contrast-high">High Contrast</option>
              </select>
            </label>
          </div>
        </section>

        {/* Color Vision */}
        <section>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Color Vision</h3>
          <select
            value={lensState.colorVision || ""}
            onChange={(e) => onLensChange({ colorVision: e.target.value || null })}
            className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Normal</option>
            <option value="protanopia">Protanopia (Red-Blind)</option>
            <option value="deuteranopia">Deuteranopia (Green-Blind)</option>
            <option value="tritanopia">Tritanopia (Blue-Blind)</option>
          </select>
        </section>

        {/* Motion */}
        <section>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Motion</h3>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={lensState.reducedMotion}
              onChange={(e) => onLensChange({ reducedMotion: e.target.checked })}
              className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-blue-500 focus:ring-blue-500"
            />
            <span className="text-sm text-slate-300">Reduced Motion</span>
          </label>
        </section>

        {/* Typography */}
        <section>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Typography</h3>
          <div className="space-y-2">
            <label className="block">
              <span className="text-sm text-slate-300 mb-1 block">Font Scale</span>
              <select
                value={lensState.fontScale || ""}
                onChange={(e) => onLensChange({ fontScale: e.target.value || null })}
                className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="">100% (Default)</option>
                <option value="font-large">125% Large</option>
                <option value="font-xlarge">150% Extra Large</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm text-slate-300 mb-1 block">Line Height</span>
              <select
                value={lensState.lineHeight || ""}
                onChange={(e) => onLensChange({ lineHeight: e.target.value || null })}
                className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Normal</option>
                <option value="line-height-relaxed">Relaxed (1.8)</option>
                <option value="line-height-loose">Loose (2.2)</option>
              </select>
            </label>
          </div>
        </section>

        {/* Focus Aids */}
        <section>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Focus Aids</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={lensState.readingRuler}
                onChange={(e) => onLensChange({ readingRuler: e.target.checked })}
                className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-blue-500 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-300">Reading Ruler</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={lensState.tabHighlight}
                onChange={(e) => onLensChange({ tabHighlight: e.target.checked })}
                className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-blue-500 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-300">Tab Highlight</span>
            </label>
          </div>
        </section>

        <button
          onClick={() => onLensChange({
            blur: null, contrast: null, colorVision: null, reducedMotion: false,
            fontScale: null, lineHeight: null, readingRuler: false, tabHighlight: false,
          })}
          className="w-full py-2 px-4 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition-colors"
        >
          Reset All Lenses
        </button>
      </div>
    </div>
  );
}
