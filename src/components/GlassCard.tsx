import { ReactNode } from "react";
import { GlassCard as DSGlassCard } from "@/design-system";

interface GlassCardProps {
  /** Disable hover lift effect (for selected/active items) */
  noHover?: boolean;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

/**
 * GlassCard — backward-compatible wrapper.
 *
 * Delegates to the design-system GlassCard.
 * The className prop is accepted for legacy usage but
 * visual styling is now fully driven by the design system.
 */
export default function GlassCard({ children, className, onClick, style, noHover }: GlassCardProps) {
  return (
    <DSGlassCard
      onClick={onClick}
      noHover={noHover}
      style={style}
    >
      {children}
    </DSGlassCard>
  );
}
