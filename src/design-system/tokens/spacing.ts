/**
 * Spacing & Layout Tokens
 *
 * Based on a 4px grid. Values in px.
 */

export const space = {
  /** 4px — micro / icon padding */
  1: 4,
  /** 8px — inline gap, compact padding */
  2: 8,
  /** 12px — standard inline gap */
  3: 12,
  /** 16px — standard padding */
  4: 16,
  /** 20px — generous padding, card padding */
  5: 20,
  /** 24px — section padding */
  6: 24,
  /** 32px — layout gap, large padding */
  8: 32,
  /** 40px — section gap */
  10: 40,
  /** 48px — page padding */
  12: 48,
} as const;

export const radii = {
  /** 6px — small elements (badges, tags) */
  sm: 6,
  /** 10px — buttons, inputs, toggles */
  md: 10,
  /** 14px — cards */
  lg: 14,
  /** 16px — panels */
  xl: 16,
  /** 20px — root window, modals */
  "2xl": 20,
  /** 9999px — pill / fully rounded */
  full: 9999,
} as const;

export const fontSizes = {
  xs:  11,
  sm:  12,
  md:  13,
  lg:  15,
  xl:  18,
  "2xl": 22,
  "3xl": 28,
} as const;

export const iconSizes = {
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
} as const;

export const zLayers = {
  base:     0,
  surface:  1,
  overlay:  10,
  sidebar:  20,
  titlebar: 30,
  modal:    50,
  toast:    60,
  tooltip:  70,
} as const;