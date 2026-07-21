/**
 * GlassCard — Elevated Glass Surface
 *
 * A content card with rounded corners, padding, shadow,
 * and optional hover/tap interaction. Designed to replace
 * the existing src/components/GlassCard.tsx.
 *
 * Uses GlassSurface internally and adds card-semantic defaults:
 * - padding: 20px
 * - radius: from material tier (default lg = 14px)
 * - hover: glass scale + shadow lift
 * - entry: glass entrance animation (blur-in + fade + scale)
 */

import { forwardRef, type ReactNode } from "react";
import type { HTMLMotionProps } from "framer-motion";
import { GlassSurface, type GlassSurfaceProps } from "./GlassSurface";
import { glassEntrance, glassHover, glassLift } from "../animations";
import type { GlassTier } from "../tokens";
import { space } from "../tokens";

export interface GlassCardProps extends GlassSurfaceProps {
  children?: ReactNode;
  /** Click handler — adds cursor:pointer and hover effects */
  onClick?: () => void;
  /** Disable entry animation */
  noAnimation?: boolean;
  /** Disable hover lift effect */
  noHover?: boolean;
  /** Use pronounced lift hover (for featured/hero cards) */
  featured?: boolean;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  function GlassCard(
    {
      children,
      tier = "regular",
      onClick,
      noAnimation = false,
      noHover = false,
      featured = false,
      style,
      ...rest
    },
    ref
  ) {
    const isInteractive = !!onClick;

    const cardMotionProps: Partial<HTMLMotionProps<"div">> = {
      ...(noAnimation
        ? {}
        : {
            variants: glassEntrance,
            initial: "hidden",
            animate: "visible",
          }),
      ...(noHover || !isInteractive
        ? {}
        : featured
          ? { ...glassLift }
          : { ...glassHover }),
    };

    return (
      <GlassSurface
        ref={ref}
        tier={tier}
        onClick={onClick}
        style={{
          padding: space[5],
          cursor: isInteractive ? "pointer" : undefined,
          ...(style as React.CSSProperties),
        }}
        {...cardMotionProps}
        {...rest}
      >
        {children}
      </GlassSurface>
    );
  }
);

export default GlassCard;
