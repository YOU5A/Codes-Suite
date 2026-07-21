/**
 * GlassToggle — Liquid Glass Toggle Switch
 *
 * Apple-style toggle switch with glass styling.
 * Replaces the inline toggle in Settings page.
 */

import { motion } from "framer-motion";

export interface GlassToggleProps {
  /** Current state */
  active: boolean;
  /** Change handler */
  onChange: (active: boolean) => void;
  /** Disabled */
  disabled?: boolean;
  /** Size: sm | md (default) */
  size?: "sm" | "md";
}

const sizeConfig = {
  sm: { width: 36, height: 20, radius: 10, knob: 14, knobOffset: 2 },
  md: { width: 44, height: 26, radius: 13, knob: 20, knobOffset: 3 },
};

export function GlassToggle({
  active,
  onChange,
  disabled = false,
  size = "md",
}: GlassToggleProps) {
  const cfg = sizeConfig[size];

  return (
    <div
      role="switch"
      aria-checked={active}
      tabIndex={disabled ? -1 : 0}
      onClick={() => !disabled && onChange(!active)}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && !disabled) {
          e.preventDefault();
          onChange(!active);
        }
      }}
      style={{
        width: cfg.width,
        height: cfg.height,
        borderRadius: cfg.radius,
        position: "relative",
        cursor: disabled ? "not-allowed" : "pointer",
        flexShrink: 0,
        background: active ? "var(--accent)" : "var(--bg-tertiary)",
        border: active ? "none" : "1px solid var(--border-color)",
        transition: "background var(--transition-fast) ease, border-color var(--transition-fast) ease",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <motion.div
        animate={{
          left: active ? cfg.width - cfg.knob - cfg.knobOffset : cfg.knobOffset,
        }}
        transition={{ type: "spring", stiffness: 500, damping: 30, mass: 0.8 }}
        style={{
          position: "absolute",
          top: cfg.knobOffset,
          width: cfg.knob,
          height: cfg.knob,
          borderRadius: "50%",
          background: "white",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        }}
      />
    </div>
  );
}

export default GlassToggle;
