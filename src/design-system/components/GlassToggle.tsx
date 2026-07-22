/**
 * GlassToggle — Liquid Glass Toggle Switch
 *
 * Apple-style toggle switch with glass styling.
 * Uses flexbox centering — no absolute positioning drift.
 */

import { motion } from "framer-motion";

export interface GlassToggleProps {
  active: boolean;
  onChange: (active: boolean) => void;
  disabled?: boolean;
  size?: "sm" | "md";
}

const sizeConfig = {
  sm: { width: 36, height: 20, radius: 10, knob: 14, pad: 2 },
  md: { width: 44, height: 26, radius: 13, knob: 20, pad: 3 },
};

export function GlassToggle({
  active,
  onChange,
  disabled = false,
  size = "md",
}: GlassToggleProps) {
  const cfg = sizeConfig[size];
  const knobTravel = cfg.width - cfg.knob - 2 * cfg.pad;

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
        display: "flex",
        alignItems: "center",
        width: cfg.width,
        height: cfg.height,
        borderRadius: cfg.radius,
        padding: `0 ${cfg.pad}px`,
        cursor: disabled ? "not-allowed" : "pointer",
        flexShrink: 0,
        boxSizing: "border-box",
        background: active ? "var(--accent)" : "var(--bg-tertiary)",
        border: "1px solid",
        borderColor: active ? "transparent" : "var(--border-color)",
        transition: "background var(--transition-fast) ease, border-color var(--transition-fast) ease",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <motion.div
        animate={{ x: active ? knobTravel : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30, mass: 0.8 }}
        style={{
          width: cfg.knob,
          height: cfg.knob,
          borderRadius: "50%",
          background: "white",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
          flexShrink: 0,
        }}
      />
    </div>
  );
}

export default GlassToggle;