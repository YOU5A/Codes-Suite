import { ReactNode } from "react";
import { GlassCard as DSGlassCard } from "@/design-system";

interface GlassCardProps {
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
export default function GlassCard({ children, className, onClick, style }: GlassCardProps) {
  return (
    <DSGlassCard
      onClick={onClick}
      style={style}
    >
      {children}
    </DSGlassCard>
  );
}
