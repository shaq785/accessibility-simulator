import { Finding, LensState } from "./types";

export const findings: Finding[] = [
  {
    id: "contrast-bad-text",
    lens: ["contrast-low"],
    demoPage: "bad",
    title: "Low contrast text is now barely visible",
    description: "The gray text on the bad demo had poor contrast to begin with. With reduced contrast, it becomes nearly impossible to read. Use sufficient color contrast ratios (WCAG recommends 4.5:1 for normal text).",
    severity: "error",
  },
  {
    id: "contrast-good-text",
    lens: ["contrast-low"],
    demoPage: "good",
    title: "Text remains readable with reduced contrast",
    description: "The good demo uses high-contrast colors that remain readable even when contrast is reduced.",
    severity: "info",
  },
  {
    id: "blur-bad-small-text",
    lens: ["blur-mild", "blur-moderate", "blur-severe"],
    demoPage: "bad",
    title: "Small text becomes unreadable with blur",
    description: "The bad demo uses small font sizes (12px) that become illegible with blur. Users with uncorrected vision experience similar effects.",
    severity: "error",
  },
  {
    id: "blur-good-text",
    lens: ["blur-mild", "blur-moderate", "blur-severe"],
    demoPage: "good",
    title: "Larger text holds up better with blur",
    description: "The good demo uses larger base font sizes that remain more readable with mild vision impairment.",
    severity: "info",
  },
  {
    id: "color-vision-bad-links",
    lens: ["protanopia", "deuteranopia", "tritanopia"],
    demoPage: "bad",
    title: "Links indistinguishable from regular text",
    description: "The bad demo relies solely on color to indicate links. With color vision deficiency, these blend into surrounding text. Always use underlines or other visual indicators.",
    severity: "error",
  },
  {
    id: "color-vision-good-links",
    lens: ["protanopia", "deuteranopia", "tritanopia"],
    demoPage: "good",
    title: "Links remain identifiable",
    description: "The good demo uses underlines and hover effects in addition to color, making links identifiable regardless of color perception.",
    severity: "info",
  },
  {
    id: "color-vision-bad-buttons",
    lens: ["protanopia", "deuteranopia"],
    demoPage: "bad",
    title: "Red/green color coding is lost",
    description: "The bad demo uses red and green colors to indicate 'delete' and 'confirm' actions. Users with red-green color blindness cannot distinguish these. Use icons and text labels instead.",
    severity: "error",
  },
  {
    id: "motion-bad-animations",
    lens: ["reduced-motion"],
    demoPage: "bad",
    title: "Animations stopped (would cause issues)",
    description: "The bad demo has constant animations that could trigger vestibular disorders. With reduced motion, these stop. Good practice: respect prefers-reduced-motion.",
    severity: "warning",
  },
  {
    id: "motion-good-animations",
    lens: ["reduced-motion"],
    demoPage: "good",
    title: "Subtle animations gracefully disabled",
    description: "The good demo respects reduced motion preferences. Essential animations are replaced with instant state changes.",
    severity: "info",
  },
  {
    id: "typography-bad-spacing",
    lens: ["font-large", "font-xlarge", "line-height-relaxed", "line-height-loose"],
    demoPage: "bad",
    title: "Layout breaks with increased text size",
    description: "The bad demo uses fixed heights and overflow:hidden, causing text to be cut off. Accessible layouts should accommodate text resizing up to 200%.",
    severity: "error",
  },
  {
    id: "typography-good-spacing",
    lens: ["font-large", "font-xlarge", "line-height-relaxed", "line-height-loose"],
    demoPage: "good",
    title: "Layout adapts to text adjustments",
    description: "The good demo uses flexible layouts that accommodate increased font sizes and line heights.",
    severity: "info",
  },
  {
    id: "tab-bad-order",
    lens: ["tab-highlight"],
    demoPage: "bad",
    title: "Tab order is confusing",
    description: "The bad demo has illogical tab order due to improper tabindex values. Keyboard users will jump around unpredictably.",
    severity: "error",
  },
  {
    id: "tab-bad-visible",
    lens: ["tab-highlight"],
    demoPage: "bad",
    title: "Focus indicators were removed",
    description: "The bad demo removes default focus outlines. The simulator adds visible focus rings, but the original design left keyboard users blind to their location.",
    severity: "error",
  },
  {
    id: "tab-good-order",
    lens: ["tab-highlight"],
    demoPage: "good",
    title: "Logical tab order maintained",
    description: "The good demo follows natural DOM order and uses proper focus management. Tab navigation flows logically.",
    severity: "info",
  },
  {
    id: "reading-ruler-general",
    lens: ["reading-ruler"],
    demoPage: "both",
    title: "Reading ruler active",
    description: "The reading ruler helps users with dyslexia or attention difficulties track their reading position. Move your mouse vertically to follow along.",
    severity: "info",
  },
  {
    id: "baseline-bad",
    lens: [],
    demoPage: "bad",
    title: "Viewing: Inaccessible Demo",
    description: "This demo contains common accessibility mistakes: poor contrast, missing labels, improper focus management, and color-only indicators. Enable lenses to see the impact.",
    severity: "warning",
  },
  {
    id: "baseline-good",
    lens: [],
    demoPage: "good",
    title: "Viewing: Accessible Demo",
    description: "This demo follows accessibility best practices: proper contrast, descriptive labels, logical focus order, and multiple visual indicators. Enable lenses to see how it holds up.",
    severity: "info",
  },
];

export function getActiveFindings(lensState: LensState, demoPage: "good" | "bad"): Finding[] {
  const activeLenses: string[] = [];
  
  if (lensState.blur) activeLenses.push(lensState.blur);
  if (lensState.contrast) activeLenses.push(lensState.contrast);
  if (lensState.colorVision) activeLenses.push(lensState.colorVision);
  if (lensState.reducedMotion) activeLenses.push("reduced-motion");
  if (lensState.fontScale) activeLenses.push(lensState.fontScale);
  if (lensState.lineHeight) activeLenses.push(lensState.lineHeight);
  if (lensState.readingRuler) activeLenses.push("reading-ruler");
  if (lensState.tabHighlight) activeLenses.push("tab-highlight");

  return findings.filter((finding) => {
    const matchesPage = finding.demoPage === demoPage || finding.demoPage === "both";
    if (finding.lens.length === 0) {
      return matchesPage && activeLenses.length === 0;
    }
    const matchesLens = finding.lens.some((lens) => activeLenses.includes(lens));
    return matchesPage && matchesLens;
  });
}
