/**
 * GlassPanel — Full-Area Content Panel
 *
 * A large glass surface designed for main content areas.
 * Includes overflow scrolling, generous padding, and
 * optional border/separator styling. Uses the "thick"
 * material tier by default for prominent visual weight.
 */

import { forwardRef, type ReactNode } from "react";
import { GlassSurface, type GlassSurfaceProps } from "./GlassSurface";
import type { GlassTier } from "../tokens";
import { space } from "../tokens";

export interface GlassPanelProps extends GlassSurfaceProps {
  children?: ReactNode;
  /** Custom padding (default: 24px) */
  padding?: number;
  /** Enable scroll within panel */
  scrollable?: boolean;
}

export const GlassPanel = forwardRef<HTMLDivElement, GlassPanelProps>(
  function GlassPanel(
    {
      children,
      tier = "thick",
      padding = space[6],
      scrollable = false,
      style,
      ...rest
    },
    ref
  ) {
    return (
      <GlassSurface
        ref={ref}
        tier={tier}
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