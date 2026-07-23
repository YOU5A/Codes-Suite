/**
 * GlassLayout — Root Application Shell
 *
 * The outermost layout container that establishes:
 * - FluidBackground layer (Canvas 2D blob fluid)
 * - Background layer (gradient mesh + animated light)
 * - Content area with backdrop blur and border
 * - Proper z-index stacking for titlebar, sidebar, and main
 */

import { type ReactNode } from "react";
import { GlassBackground, type GlassBackgroundProps } from "./GlassBackground";
import FluidBackground from "../../components/FluidBackground";

export interface GlassLayoutProps {
  children?: ReactNode;
  /** Background configuration */
  background?: GlassBackgroundProps;
  /** CSS class to add to the root shell */
  className?: string;
}

export function GlassLayout({
  children,
  background,
  className,
}: GlassLayoutProps) {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        isolation: "isolate",
      }}
    >
      {/* Depth layer 0: fluid background (Canvas) */}
      <FluidBackground preset="auto" intensity={0.6} />

      {/* Depth layer 1: gradient mesh overlay */}
      <GlassBackground {...background} />

      {/* Depth layer 2+: content shell */}
      <div
        className={"app-root" + (className ? " " + className : "")}
      >
        {children}
      </div>
    </div>
  );
}

export default GlassLayout;
