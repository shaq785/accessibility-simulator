export type LensCategory = "vision" | "colorVision" | "motion" | "typography" | "focus";

export interface LensState {
  blur: string | null;
  contrast: string | null;
  colorVision: string | null;
  reducedMotion: boolean;
  fontScale: string | null;
  lineHeight: string | null;
  readingRuler: boolean;
  tabHighlight: boolean;
}

export interface Finding {
  id: string;
  lens: string[];
  demoPage: "good" | "bad" | "both";
  title: string;
  description: string;
  severity: "info" | "warning" | "error";
}

export const defaultLensState: LensState = {
  blur: null,
  contrast: null,
  colorVision: null,
  reducedMotion: false,
  fontScale: null,
  lineHeight: null,
  readingRuler: false,
  tabHighlight: false,
};
