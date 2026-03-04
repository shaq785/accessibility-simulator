import type { AeoExtracted } from "@/lib/aeo/types";

export const GOOD_EXTRACTED: AeoExtracted = {
  title: "What is Compost? Definition, Benefits, and How to Start | GreenLife",
  metaDescription:
    "Compost is decayed organic matter used to enrich soil. Learn what compost is, its benefits for gardens and the environment, and how to start composting at home in simple steps.",
  canonical: "(same page)",
  h1: "What is Compost?",
  headings: [
    { level: 1, text: "What is Compost?" },
    { level: 2, text: "Benefits of Composting" },
    { level: 2, text: "How to Start Composting" },
    { level: 2, text: "Frequently Asked Questions" },
  ],
  topParagraphs: [
    "Compost is decayed organic matter—such as leaves, food scraps, and yard waste—that is used to enrich soil and improve plant growth. It is often called 'black gold' because it adds nutrients and improves soil structure, helping gardens thrive without chemical fertilizers.",
  ],
  faq: [
    { q: "What can I put in compost?", a: "You can add fruit and vegetable scraps, coffee grounds, eggshells, leaves, grass clippings, and small amounts of paper. Avoid meat, dairy, and oily foods." },
    { q: "How long does composting take?", a: "A simple pile may take 6 months to 2 years. With proper turning and moisture, hot compost can be ready in a few weeks to a few months." },
    { q: "Do I need a bin to compost?", a: "No. You can use a simple pile, a wire bin, or a purchased compost bin. Choose based on space and how much material you have." },
  ],
  jsonLdTypes: ["Organization", "FAQPage"],
  keyLinks: [
    { text: "About GreenLife", href: "#about" },
    { text: "Contact us", href: "#contact" },
    { text: "Composting guide", href: "#how-to-start" },
  ],
  suggestedAnswerSnippet:
    "Compost is decayed organic matter—such as leaves, food scraps, and yard waste—that is used to enrich soil and improve plant growth.",
};

export const BAD_EXTRACTED: AeoExtracted = {
  title: "Page",
  metaDescription: "(none)",
  canonical: "(none)",
  h1: "(none)",
  headings: [
    { level: 2, text: "Stuff" },
    { level: 4, text: "More stuff" },
  ],
  topParagraphs: [],
  faq: [],
  jsonLdTypes: [],
  keyLinks: [
    { text: "click here", href: "#" },
    { text: "read more", href: "#" },
  ],
  suggestedAnswerSnippet: "(none)",
};
