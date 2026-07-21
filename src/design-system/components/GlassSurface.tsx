/**
 * GlassSurface — Base Glass Primitive
 *
 * The lowest-level glass container. Renders a div with
 * backdrop-filter blur, semi-transparent background, and
 * border styling based on the selected material tier.
 *
 * Does NOT add padding, radius, or layout by default —
 * those are controlled by the tier's material and can
 * be overridden via props.
 */

import { forwardRef, type ReactNode } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { materialToStyle } from "../materials";
import type { GlassTier } from "../tokens";

export interface GlassSurfaceProps extends HTMLMotionProps<"div"> {
  children?: ReactNode;
  /** Material tier: ultraThin | regular | thick | elevated */
  tier?: GlassTier;
  /** Disable backdrop-filter blur (for performance) */
  noBlur?: boolean;
  /** Override material styles */
  styleOverrides?: Partial<{
    radius: number;
    shadow: string;
    border: string;
  }>;
}

export const GlassSurface = forwardRef<HTMLDivElement, GlassSurfaceProps>(
  function GlassSurface(
    { children, tier = "regular", noBlur = false, styleOverrides, style, ...rest },
    ref
  ) {
    const baseStyle = materialToStyle(tier, styleOverrides);

    if (noBlur) {
      baseStyle.backdropFilter = "none";
      baseStyle.WebkitBackdropFilter = "none";
    }

    return (
      <motion.div
        ref={ref}
        style={{ position: "relative", ...baseStyle, ...style }}
        {...rest}
      >
        {children}
      </motion.div>
    );
  }
);

export default GlassSurface;