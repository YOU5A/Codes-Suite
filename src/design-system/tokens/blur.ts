/**
 * Liquid Glass Blur Hierarchy
 *
 * Three-tier blur system inspired by Apple's glass design language.
 * Each tier maps to a distinct visual depth level.
 *
 * Values are applied via backdrop-filter with both standard and
 * -webkit- prefixed versions for Electron (Chromium) compatibility.
 */

export type GlassTier = "ultraThin" | "regular" | "thick" | "elevated";

export interface BlurConfig {
  /** backdrop-filter blur radius in px */
  blur: number;
  /** backdrop-filter saturation (0 = grayscale, 1 = normal) */
  saturation: number;
  /** background opacity multiplier (0-1) */
  opacity: number;
  /** CSS backdrop-filter value string */
  cssValue: string;
}

export const blurHierarchy: Record<GlassTier, BlurConfig> = {
  ultraThin: {
    blur: 8,
    saturation: 1.8,
    opacity: 0.35,
    cssValue: "blur(8px) saturate(1.8)",
  },
  regular: {
    blur: 20,
    saturation: 1.8,
    opacity: 0.55,
    cssValue: "blur(20px) saturate(1.8)",
  },
  thick: {
    blur: 40,
    saturation: 2.0,
    opacity: 0.72,
    cssValue: "blur(40px) saturate(2.0)",
  },
  elevated: {
    blur: 30,
    saturation: 2.0,
    opacity: 0.88,
    cssValue: "blur(30px) saturate(2.0)",
  },
} as const;

/** Helper: generate CSS backdrop-filter property for a given tier */
export function getBackdropFilter(tier: GlassTier): string {
  return blurHierarchy[tier].cssValue;
}