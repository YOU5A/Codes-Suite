/**
 * GlassMain — Primary Content Area
 *
 * The main content panel of the application. Provides:
 * - Consistent padding and spacing
 * - Scrollable content container
 * - Optional background tint
 * - Optional scroll edge fade mask
 * - Responsive behavior via CSS grid
 *
 * Works with GlassSurface to maintain the blur hierarchy.
 */

import { forwardRef, type ReactNode } from "react";
import type { GlassTier } from "../tokens";

export interface GlassMainProps {
  children?: ReactNode;
  /** Glass tier for background. Default: none (transparent, inherits from layout). */
  tier?: GlassTier;
  /** Content padding in px. Default: 24 (compact: 16). */
  padding?: number;
  /** Max content width. Default: none (full). */
  maxWidth?: number;
  /** Enable scroll edge fade gradient mask on top/bottom edges. Default: true. */
  scrollFade?: boolean;
}

export const GlassMain = forwardRef<HTMLElement, GlassMainProps>(
  function GlassMain(
    {
      children,
      tier,
      padding,
      maxWidth,
      scrollFade = true,
    },
    ref
  ) {
    const className = scrollFade
      ? "glass-main glass-main--scroll-fade"
      : "glass-main";
    return (
      <main
        ref={ref}
        className={className}
        style={{
          flex: 1,
          overflow: "auto",
          padding: padding ?? "var(--content-padding, 24px)",
          maxWidth: maxWidth ?? "none",
          margin: maxWidth ? "0 auto" : undefined,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {children}
      </main>
    );
  }
);

export default GlassMain;
