/**
 * GlassEmptyState — Liquid Glass Empty State
 *
 * A centered placeholder for empty lists, no-data states,
 * and loading indicators. Uses glass styling with icon support.
 *
 * @module design-system/components/GlassEmptyState
 */

import { type ReactNode } from "react";
import { GlassSurface } from "./GlassSurface";
import { space, fontSizes } from "../tokens";

export interface GlassEmptyStateProps {
  /** Icon element (lucide-react or similar) */
  icon?: ReactNode;
  /** Primary message */
  title?: string;
  /** Secondary description */
  description?: string;
  /** Optional action button */
  action?: ReactNode;
  /** Custom style */
  style?: React.CSSProperties;
}

export function GlassEmptyState({ icon, title, description, action, style }: GlassEmptyStateProps) {
  return (
    <GlassSurface
      tier="ultraThin"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: `${space[8]}px ${space[5]}px`,
        textAlign: "center",
        borderRadius: 12,
        ...style,
      }}
    >
      {icon && (
        <div
          style={{
            color: "var(--text-tertiary)",
            marginBottom: space[3],
            opacity: 0.6,
          }}
        >
          {icon}
        </div>
      )}
      {title && (
        <div
          style={{
            fontSize: fontSizes.md,
            fontWeight: 500,
            color: "var(--text-secondary)",
            marginBottom: description ? space[1] : 0,
          }}
        >
          {title}
        </div>
      )}
      {description && (
        <div
          style={{
            fontSize: fontSizes.sm,
            color: "var(--text-tertiary)",
            lineHeight: 1.5,
            maxWidth: 280,
          }}
        >
          {description}
        </div>
      )}
      {action && <div style={{ marginTop: space[4] }}>{action}</div>}
    </GlassSurface>
  );
}

export default GlassEmptyState;