/**
 * Liquid Glass Animation System
 *
 * Spring-based animation presets for Framer Motion.
 * Inspired by Apple's spring physics — responsive, fluid,
 * never sluggish or overshooting.
 *
 * The existing animation utilities in @/utils/animations.ts
 * handle timing-based transitions (opacity, page switches).
 * This module adds spring-based configs for glass surfaces,
 * interactive elements, and layout transitions.
 */

import type { Transition, Variants } from "framer-motion";

/* ─── Spring Configurations ─── */

/** Default Apple-style spring — fluid, no overshoot */
export const springDefault: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
  mass: 0.8,
};

/** Snappy spring — for buttons, toggles, micro-interactions */
export const springSnappy: Transition = {
  type: "spring",
  stiffness: 500,
  damping: 35,
  mass: 0.5,
};

/** Bouncy spring — for cards, panels, reveal animations */
export const springBouncy: Transition = {
  type: "spring",
  stiffness: 200,
  damping: 18,
  mass: 0.8,
};

/** Gentle spring — for modals, large surfaces */
export const springGentle: Transition = {
  type: "spring",
  stiffness: 150,
  damping: 20,
  mass: 1,
};

/** Smooth spring — for hover scale effects */
export const springSmooth: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 30,
  mass: 1,
};

/* ─── Timing Transition Presets ─── */

/** Fade + slide up entry (page-level, cards) */
export const fadeSlideUp: Transition = {
  duration: 0.25,
  ease: [0.16, 1, 0.3, 1],
};

/** Fade only (subtle elements, overlays) */
export const fadeOnly: Transition = {
  duration: 0.2,
  ease: "easeOut",
};

/** Scale bounce (modals, dialogs) */
export const scaleBounce: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 25,
  mass: 0.8,
};

/* ─── Motion Variants ─── */

/** Card / panel entry animation */
export const cardVariants: Variants = {
  hidden: { opacity: 0, y: 12, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
      mass: 0.8,
      staggerChildren: 0.05,
    } satisfies Transition,
  },
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.98,
    transition: { duration: 0.15, ease: "easeIn" as const } satisfies Transition,
  },
};

/** Modal / overlay entry animation */
export const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
      mass: 0.8,
    } satisfies Transition,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.15, ease: "easeIn" as const } satisfies Transition,
  },
};

/** List item stagger animation */
export const listItemVariants: Variants = {
  hidden: { opacity: 0, x: -8 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.25,
      ease: [0.16, 1, 0.3, 1],
    } satisfies Transition,
  },
};

/* ─── Interaction Presets ─── */

export const hoverScale = {
  whileHover: { scale: 1.02, transition: springSmooth },
  whileTap: { scale: 0.98, transition: springSnappy },
};

export const hoverLift = {
  whileHover: {
    y: -2,
    boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
    transition: springSmooth,
  },
  whileTap: {
    y: 0,
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    transition: springSnappy,
  },
};