/**
 * Liquid Glass Color Tokens
 *
 * These tokens read from the existing CSS custom property system
 * set by useTheme(). They do NOT manage theme state — they simply
 * provide type-safe access to the CSS variable layer and define
 * the surface/material color palette used by glass components.
 */

/* ─── CSS Variable Reference ─── */
export const CSS_VARS = {
  bg: {
    base:        "var(--bg-base)",
    primary:     "var(--bg-primary)",
    secondary:   "var(--bg-secondary)",
    tertiary:    "var(--bg-tertiary)",
    elevated:    "var(--bg-elevated)",
    glass:       "var(--bg-glass)",
  },
  border: {
    color:       "var(--border-color)",
    strong:      "var(--border-strong)",
  },
  text: {
    primary:     "var(--text-primary)",
    secondary:   "var(--text-secondary)",
    tertiary:    "var(--text-tertiary)",
  },
  accent: {
    base:        "var(--accent)",
    hover:       "var(--accent-hover)",
    bg:          "var(--accent-bg)",
    rgb:         "var(--accent-rgb)",
  },
  semantic: {
    success:     "var(--success)",
    warning:     "var(--warning)",
    danger:      "var(--danger)",
  },
  layout: {
    radius:      "var(--radius)",
    sidebarWidth:"var(--sidebar-width)",
    titlebarHeight:"var(--titlebar-height)",
  },
  transition: {
    fast:        "var(--transition-fast)",
    normal:      "var(--transition-normal)",
    slow:        "var(--transition-slow)",
  },
} as const;

/* ─── Glass Surface Colors (CSS variable-backed) ─── */
export const glass = {
  /** Ultra-thin: barely-there glass, highest transparency */
  ultraThin: {
    bg:         "var(--bg-tertiary)",
    border:     "var(--border-color)",
  },
  /** Regular: standard glass, balanced transparency */
  regular: {
    bg:         "var(--bg-secondary)",
    border:     "var(--border-color)",
  },
  /** Thick: heavy glass, lowest transparency */
  thick: {
    bg:         "var(--bg-glass)",
    border:     "var(--border-strong)",
  },
  /** Elevated: opaque glass, for modals & overlays */
  elevated: {
    bg:         "var(--bg-elevated)",
    border:     "var(--border-strong)",
  },
} as const;

/* ─── Semantic Aliases (domain-facing) ─── */
export const surface = {
  sidebar:      glass.regular,
  titlebar:     glass.ultraThin,
  card:         glass.regular,
  panel:        glass.thick,
  modal:        glass.elevated,
  tooltip:      glass.elevated,
  input:        glass.ultraThin,
} as const;