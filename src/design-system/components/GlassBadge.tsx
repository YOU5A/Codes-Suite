/**
 * GlassBadge — Liquid Glass Badge/Tag
 *
 * A small glass badge for labels, status indicators, and tags.
 * Uses glass surface with ultra-thin tier for subtle visual weight.
 *
 * @module design-system/components/GlassBadge
 */

import { type ReactNode } from "react";
import { radii, space, fontSizes } from "../tokens";

export type BadgeVariant = "default" | "accent" | "success" | "warning" | "danger";

export interface GlassBadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: "sm" | "md";
  style?: React.CSSProperties;
}

const variantStyles: Record<BadgeVariant, { bg: string; color: string; border: string }> = {
  default: {
    bg: "var(--bg-tertiary)",
    color: "var(--text-secondary)",
    border: "var(--border-color)",
  },
  accent: {
    bg: "var(--accent-bg)",
    color: "var(--accent)",
    border: "rgba(var(--accent-rgb), 0.2)",
  },
  success: {
    bg: "rgba(52, 199, 89, 0.12)",
    color: "var(--success)",
    border: "rgba(52, 199, 89, 0.2)",
  },
  warning: {
    bg: "rgba(255, 149, 0, 0.12)",
    color: "var(--warning)",
    border: "rgba(255, 149, 0, 0.2)",
  },
  danger: {
    bg: "rgba(255, 59, 48, 0.12)",
    color: "var(--danger)",
    border: "rgba(255, 59, 48, 0.2)",
  },
};

export function GlassBadge({ children, variant = "default", size = "md", style }: GlassBadgeProps) {
  const vs = variantStyles[variant];
  const padding = size === "sm" ? "2px 8px" : "3px 10px";
  const fontSize = size === "sm" ? fontSizes.xs : fontSizes.sm;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding,
        borderRadius: radii.full,
        background: vs.bg,
        color: vs.color,
        border: `1px solid ${vs.border}`,
        fontSize,
        fontWeight: 500,
        lineHeight: 1.4,
        whiteSpace: "nowrap",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        ...style,
      }}
    >
      {children}
    </span>
  );
}

export default GlassBadge;