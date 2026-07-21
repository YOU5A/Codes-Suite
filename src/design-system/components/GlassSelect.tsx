/**
 * GlassSelect — Liquid Glass Select / Dropdown
 *
 * A native-like select styled with glass materials.
 * Supports custom dropdown with popover menu.
 */

import { useState, useRef, useEffect, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { space, radii, fontSizes } from "../tokens";

export interface SelectOption {
  value: string;
  label: string;
}

export interface GlassSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  width?: number | string;
}

export function GlassSelect({
  value,
  onChange,
  options,
  placeholder = "Select...",
  disabled = false,
  fullWidth = true,
  width,
}: GlassSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
    }
  }, [open]);

  const selectedLabel =
    options.find((o) => o.value === value)?.label ?? placeholder;

  const triggerStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    background: "var(--bg-tertiary)",
    color: value ? "var(--text-primary)" : "var(--text-tertiary)",
    border: `1px solid ${open ? "var(--accent)" : "var(--border-color)"}`,
    borderRadius: radii.md,
    padding: String(space[2]) + "px " + String(space[4]) + "px",
    fontSize: fontSizes.sm,
    cursor: disabled ? "not-allowed" : "pointer",
    width: fullWidth ? (width ?? "100%") : width ?? "auto",
    outline: "none",
    userSelect: "none",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    transition: "all var(--transition-fast) ease",
    opacity: disabled ? 0.5 : 1,
    boxShadow: open ? "0 0 0 3px var(--accent-bg)" : "none",
  };

  const dropdownStyle: React.CSSProperties = {
    position: "absolute",
    top: "calc(100% + 4px)",
    left: 0,
    right: 0,
    zIndex: 50,
    background: "var(--bg-elevated)",
    backdropFilter: "blur(24px) saturate(180%)",
    WebkitBackdropFilter: "blur(24px) saturate(180%)",
    border: "1px solid var(--border-strong)",
    borderRadius: radii.md,
    padding: 4,
    boxShadow: "0 8px 32px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.08)",
    display: "flex",
    flexDirection: "column",
    gap: 1,
    maxHeight: 240,
    overflowY: "auto",
  };

  const optionBase: React.CSSProperties = {
    padding: String(space[1] + 2) + "px " + String(space[3]) + "px",
    fontSize: fontSizes.xs,
    borderRadius: radii.sm,
    cursor: "pointer",
    color: "var(--text-primary)",
    background: "transparent",
    border: "none",
    textAlign: "left",
    width: "100%",
    transition: "background var(--transition-fast) ease",
  };

  return (
    <div ref={ref} style={{ position: "relative", width: fullWidth ? (width ?? "100%") : width ?? "auto" }}>
      <div
        role="combobox"
        tabIndex={disabled ? -1 : 0}
        aria-expanded={open}
        onClick={() => !disabled && setOpen(!open)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            !disabled && setOpen(!open);
          }
          if (e.key === "Escape") setOpen(false);
        }}
        style={triggerStyle}
      >
        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {selectedLabel}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          style={{ flexShrink: 0, display: "flex", color: "var(--text-tertiary)" }}
        >
          <ChevronDown size={14} />
        </motion.span>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            variants={{
              hidden: { opacity: 0, y: -4, scale: 0.96 },
              visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 400, damping: 30, mass: 0.6 } },
              exit: { opacity: 0, y: -4, scale: 0.96, transition: { duration: 0.12, ease: "easeIn" } },
            }}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={dropdownStyle}
          >
            {options.map((opt) => {
              const isActive = opt.value === value;
              return (
                <button
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  style={{
                    ...optionBase,
                    background: isActive ? "var(--accent-bg)" : "transparent",
                    color: isActive ? "var(--accent)" : "var(--text-primary)",
                    fontWeight: isActive ? 500 : 400,
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.background = "var(--bg-tertiary)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.background = "transparent";
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default GlassSelect;
