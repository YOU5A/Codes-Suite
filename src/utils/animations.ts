// Shared animation timing and easing for Codes Suite
// All components should import from here instead of hardcoding durations.

export type AnimationSpeed = "normal" | "fast" | "off";

/** Apple-style spring-out easing curve */
export const EASE_OUT = [0.16, 1, 0.3, 1] as const;

/** Duration for page-level transitions (entry/exit, page switch) */
export function getAnimDuration(speed: AnimationSpeed): number {
  switch (speed) {
    case "off":   return 0;
    case "fast":  return 0.12;
    default:      return 0.2;
  }
}

/** Duration for micro-interactions (buttons, hover, taps) */
export function getMicroDuration(speed: AnimationSpeed): number {
  switch (speed) {
    case "off":   return 0;
    case "fast":  return 0.08;
    default:      return 0.12;
  }
}

/** CSS variable values for transition durations */
export function getCssTransitionValues(speed: AnimationSpeed) {
  if (speed === "off") {
    return { fast: "0ms", normal: "0ms", slow: "0ms" };
  }
  return {
    fast:       speed === "fast" ? "80ms"   : "120ms",
    normal:     speed === "fast" ? "150ms"  : "250ms",
    slow:       speed === "fast" ? "300ms"  : "500ms",
  };
}
