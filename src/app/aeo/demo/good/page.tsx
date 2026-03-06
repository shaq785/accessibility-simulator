import Link from "next/link";
import { GoodDemoContent, AnswerEngineView, GOOD_EXTRACTED } from "@/components/aeo";

export const metadata = {
  title: "What is Compost? Definition, Benefits, and How to Start | GreenLife",
  description:
    "Compost is decayed organic matter used to enrich soil. Learn what compost is, its benefits for gardens and the environment, and how to start composting at home in simple steps.",
};

const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    { "@type": "Question", name: "What can I put in compost?", acceptedAnswer: { "@type": "Answer", text: "You can add fruit and vegetable scraps, coffee grounds, eggshells, leaves, grass clippings, and small amounts of paper. Avoid meat, dairy, and oily foods." } },
    { "@type": "Question", name: "How long does composting take?", acceptedAnswer: { "@type": "Answer", text: "A simple pile may take 6 months to 2 years. With proper turning and moisture, hot compost can be ready in a few weeks to a few months." } },
    { "@type": "Question", name: "Do I need a bin to compost?", acceptedAnswer: { "@type": "Answer", text: "No. You can use a simple pile, a wire bin, or a purchased compost bin. Choose based on space and how much material you have." } },
    { "@type": "Question", name: "Can I compost in winter?", acceptedAnswer: { "@type": "Answer", text: "Yes. Decomposition slows in cold weather but doesn't stop. Insulate the pile with leaves or straw and turn less often." } },
    { "@type": "Question", name: "What's the ratio of greens to browns?", acceptedAnswer: { "@type": "Answer", text: "Aim for roughly 1 part greens (nitrogen-rich scraps) to 2–3 parts browns (carbon-rich leaves, paper). Balance keeps the pile healthy." } },
  ],
};

const ORG_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "GreenLife",
  url: "https://example.com",
};

const ARTICLE_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "What is Compost? Definition, Benefits, and How to Start",
  description: "Compost is decayed organic matter used to enrich soil. Learn what compost is, its benefits, and how to start composting at home.",
};

const HOWTO_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to Start Composting",
  step: [
    { "@type": "HowToStep", name: "Choose a spot", text: "Pick a dry, shaded spot for a bin or pile." },
    { "@type": "HowToStep", name: "Add browns and greens", text: "Layer browns (leaves, paper) and greens (scraps, grass)." },
    { "@type": "HowToStep", name: "Maintain", text: "Keep it moist and turn occasionally." },
  ],
};

const BREADCRUMB_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://example.com/" },
    { "@type": "ListItem", position: 2, name: "Composting Guide", item: "https://example.com/compost" },
  ],
};

export default function GoodDemoPage() {
  return (
    <div className="min-h-screen bg-slate-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_JSON_LD) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ARTICLE_JSON_LD) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(HOWTO_JSON_LD) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(BREADCRUMB_JSON_LD) }} />
      <header className="bg-slate-800 border-b border-slate-700 py-3 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/aeo" className="text-indigo-400 font-semibold hover:text-indigo-300">
            ← Back to AEO Scanner
          </Link>
          <span className="text-sm text-slate-400">Good AEO demo</span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 flex flex-col lg:flex-row gap-8">
        <article className="flex-1 min-w-0">
          <GoodDemoContent />
        </article>
        <aside className="lg:w-96 flex-shrink-0">
          <div className="sticky top-4">
            <AnswerEngineView extracted={GOOD_EXTRACTED} />
            <p className="mt-3 text-sm text-slate-500">
              This page includes JSON-LD (FAQPage + Organization) and clear structure so answer engines can extract this summary.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
