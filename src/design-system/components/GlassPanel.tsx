/**
 * GlassPanel - Full-Area Content Panel
 *
 * A large glass surface designed for main content areas.
 * Glass glow is handled internally by GlassSurface.
 */

import { forwardRef, type ReactNode } from "react";
import { GlassSurface, type GlassSurfaceProps } from "./GlassSurface";
import type { GlassTier } from "../tokens";
import { space } from "../tokens";

export interface GlassPanelProps extends GlassSurfaceProps {
  children?: ReactNode;
  padding?: number;
  scrollable?: boolean;
  noGlow?: boolean;
}

export const GlassPanel = forwardRef<HTMLDivElement, GlassPanelProps>(
  function GlassPanel(
    { children, tier = "thick", padding = space[6], scrollable = false, noGlow = false, style, ...rest },
    ref
  ) {
    return (
      <GlassSurface
        ref={ref}
        tier={tier}
        noGlow={noGlow}
        style={{
          padding,
          overflow: scrollable ? "auto" : "hidden",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          ...(style as React.CSSProperties),
        }}
        {...rest}
      >
        {children}
      </GlassSurface>
    );
  }
);

export default GlassPanel;