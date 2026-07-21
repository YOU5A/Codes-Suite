/**
 * Liquid Glass Material System
 *
 * Defines the visual properties for each glass tier.
 * Combines color tokens (from CSS vars), blur config, and
 * border/shadow styling into a unified material definition.
 *
 * Three-tier hierarchy:
 *   Ultra Thin — sidebar headings, toolbars, subtle surfaces
 *   Regular    — cards, panels, primary interactive surfaces
 *   Thick      — main content panels, prominent surfaces
 *   Elevated   — modals, dialogs, overlays
 */

import { glass } from "../tokens/colors";
import { blurHierarchy } from "../tokens/blur";
import { radii } from "../tokens/spacing";
import type { GlassTier } from "../tokens";

/* ─── Material Properties ─── */
export interface GlassMaterial {
  /** Background color (CSS variable reference) */
  bg: string;
  /** Border color (CSS variable reference) */
  border: string;
  /** Backdrop-filter blur radius in px */
  blur: number;
  /** Saturation multiplier */
  saturation: number;
  /** Background opacity */
  opacity: number;
  /** Full CSS backdrop-filter string */
  backdropFilter: string;
  /** Default border-radius for this tier */
  radius: number;
  /** Box-shadow when elevated/hovered */
  shadow: string;
}

/* ─── Shadow Presets ─── */
const SHADOWS = {
  sm: "0 1px 3px rgba(0,0,0,0.06)",
  md: "0 4px 12px rgba(0,0,0,0.08)",
  lg: "0 8px 32px rgba(0,0,0,0.10)",
  xl: "0 16px 48px rgba(0,0,0,0.12)",
} as const;

/* ─── Material Catalogue ─── */
export const materials: Record<GlassTier, GlassMaterial> = {
  ultraThin: {
    bg:             glass.ultraThin.bg,
    border:         glass.ultraThin.border,
    blur:           blurHierarchy.ultraThin.blur,
    saturation:     blurHierarchy.ultraThin.saturation,
    opacity:        blurHierarchy.ultraThin.opacity,
    backdropFilter: blurHierarchy.ultraThin.cssValue,
    radius:         radii.md,
    shadow:         SHADOWS.sm,
  },
  regular: {
    bg:             glass.regular.bg,
    border:         glass.regular.border,
    blur:           blurHierarchy.regular.blur,
    saturation:     blurHierarchy.regular.saturation,
    opacity:        blurHierarchy.regular.opacity,
    backdropFilter: blurHierarchy.regular.cssValue,
    radius:         radii.lg,
    shadow:         SHADOWS.md,
  },
  thick: {
    bg:             glass.thick.bg,
    border:         glass.thick.border,
    blur:           blurHierarchy.thick.blur,
    saturation:     blurHierarchy.thick.saturation,
    opacity:        blurHierarchy.thick.opacity,
    backdropFilter: blurHierarchy.thick.cssValue,
    radius:         radii.xl,
    shadow:         SHADOWS.lg,
  },
  elevated: {
    bg:             glass.elevated.bg,
    border:         glass.elevated.border,
    blur:           blurHierarchy.elevated.blur,
    saturation:     blurHierarchy.elevated.saturation,
    opacity:        blurHierarchy.elevated.opacity,
    backdropFilter: blurHierarchy.elevated.cssValue,
    radius:         radii["2xl"],
    shadow:         SHADOWS.xl,
  },
} as const;

/** Get material definition for a glass tier */
export function getMaterial(tier: GlassTier): GlassMaterial {
  return materials[tier];
}

/** Convert material to inline CSS properties for React style */
export function materialToStyle(
  tier: GlassTier,
  overrides?: Partial<{
    radius: number;
    shadow: string;
    border: string;
  }>
): React.CSSProperties {
  const m = materials[tier];
  return {
    background: m.bg,
    backdropFilter: m.backdropFilter,
    WebkitBackdropFilter: m.backdropFilter,
    border: `1px solid ${overrides?.border ?? m.border}`,
    borderRadius: overrides?.radius ?? m.radius,
    boxShadow: overrides?.shadow ?? m.shadow,
  };
}