/**
 * GlassCard - Elevated Glass Surface
 *
 * A content card with rounded corners, padding, shadow,
 * optional hover/tap interaction, and glass glow (via GlassSurface).
 */

import { forwardRef, type ReactNode } from "react";
import type { HTMLMotionProps } from "framer-motion";
import { GlassSurface, type GlassSurfaceProps } from "./GlassSurface";
import { glassEntrance, glassHover, glassLift } from "../animations";
import type { GlassTier } from "../tokens";
import { space } from "../tokens";

export interface GlassCardProps extends GlassSurfaceProps {
  children?: ReactNode;
  onClick?: () => void;
  noAnimation?: boolean;
  noHover?: boolean;
  featured?: boolean;
  noGlow?: boolean;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  function GlassCard(
    { children, tier = "regular", onClick, noAnimation = false, noHover = false, featured = false, noGlow = false, style, ...rest },
    ref
  ) {
    const isInteractive = !!onClick;

    const cardMotionProps: Partial<HTMLMotionProps<"div">> = {
      ...(noAnimation ? {} : { variants: glassEntrance, initial: "hidden", animate: "visible" }),
      ...(noHover || !isInteractive ? {} : featured ? { ...glassLift } : { ...glassHover }),
    };

    return (
      <GlassSurface
        ref={ref}
        tier={tier}
        noGlow={noGlow}
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