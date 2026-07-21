/**
 * GlassLayout — Root Application Shell
 *
 * The outermost layout container that establishes:
 * - Background layer (gradient mesh + animated light)
 * - Content area with backdrop blur and border
 * - Proper z-index stacking for titlebar, sidebar, and main
 *
 * Designed to replace the inline layout in App.tsx
 * while preserving all routing, state, and logic.
 */

import { type ReactNode } from "react";
import { GlassBackground, type GlassBackgroundProps } from "./GlassBackground";

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
      {/* Depth layer 0: animated background */}
      <GlassBackground {...background} />

      {/* Depth layer 1: content shell */}
      <div
        className={"app-root" + (className ? " " + className : "")}
      >
        {children}
      </div>
    </div>
  );
}

export default GlassLayout;
