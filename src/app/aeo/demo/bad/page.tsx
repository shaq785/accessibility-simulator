import Link from "next/link";
import { BadDemoContent, AnswerEngineView, BAD_EXTRACTED } from "@/components/aeo";

export const metadata = {
  title: "Page",
  description: "",
};

export default function BadDemoPage() {
  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700 py-3 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/aeo" className="text-indigo-400 font-semibold hover:text-indigo-300">
            ← Back to AEO Scanner
          </Link>
          <span className="text-sm text-slate-400">Bad AEO demo</span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 flex flex-col lg:flex-row gap-8">
        <article className="flex-1 min-w-0">
          <BadDemoContent />
        </article>
        <aside className="lg:w-96 flex-shrink-0">
          <div className="sticky top-4">
            <AnswerEngineView extracted={BAD_EXTRACTED} />
            <p className="mt-3 text-sm text-slate-500">
              This page has no JSON-LD, weak title and meta, multiple H2/H4 jump, long paragraphs, no FAQ, and vague link text.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
