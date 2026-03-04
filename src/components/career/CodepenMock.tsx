"use client";

/**
 * CodePen-style mock: left = faux code, right = live preview (button + headline).
 */
export function CodepenMock() {
  return (
    <div className="flex flex-col md:flex-row gap-4 w-full max-w-4xl">
      {/* Code editor panel */}
      <div className="flex-1 rounded-xl border-4 border-slate-300 bg-slate-800 overflow-hidden">
        <div className="bg-slate-700 px-3 py-2 text-slate-300 text-sm font-medium">
          Code
        </div>
        <pre className="p-4 text-left text-sm md:text-base font-mono text-green-300 overflow-x-auto">
          <code>{`<h1>Hello!</h1>
<button>Click me</button>`}</code>
        </pre>
        <pre className="p-4 pt-0 text-left text-sm md:text-base font-mono text-blue-300 overflow-x-auto">
          <code>{`button {
  background: blue;
  color: white;
}`}</code>
        </pre>
      </div>
      {/* Live preview */}
      <div className="flex-1 rounded-xl border-4 border-slate-300 bg-white overflow-hidden">
        <div className="bg-slate-200 px-3 py-2 text-slate-600 text-sm font-medium">
          Preview
        </div>
        <div className="p-6 flex flex-col gap-4 items-start">
          <h2 className="text-2xl font-bold text-slate-800">Hello!</h2>
          <button
            type="button"
            className="px-6 py-3 rounded-lg bg-blue-500 text-white font-medium"
            tabIndex={-1}
            aria-hidden
          >
            Click me
          </button>
        </div>
      </div>
    </div>
  );
}
