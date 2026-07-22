/**
 * GlassSelect — Liquid Glass Select / Dropdown
 *
 * A native-like select styled with glass materials.
 * Uses portal-based dropdown (like GlassModal) to avoid
 * clipping from overflow:auto parents (e.g. GlassMain).
 *
 * Trigger styling matches GlassButton secondary variant exactly.
 */

import { useState, useRef, useEffect, useMemo, useCallback, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import type { Transition } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { space, radii, fontSizes, zLayers } from "../tokens";
import { useTheme } from "@/hooks/useTheme";

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
  const { settings } = useTheme();
  const dropdownTransition: Transition = useMemo(() => {
    if (settings.animationSpeed === "off") return { duration: 0 };
    if (settings.animationSpeed === "normal") return { type: "spring", stiffness: 250, damping: 28, mass: 0.7 };
    return { type: "spring", stiffness: 400, damping: 30, mass: 0.6 };
  }, [settings.animationSpeed]);

  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });

  const updateDropdownPos = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDropdownPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    }
  }, []);

  useEffect(() => {
    if (open) {
      updateDropdownPos();
      window.addEventListener("scroll", updateDropdownPos, true);
      window.addEventListener("resize", updateDropdownPos);
      return () => {
        window.removeEventListener("scroll", updateDropdownPos, true);
        window.removeEventListener("resize", updateDropdownPos);
      };
    }
  }, [open, updateDropdownPos]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (dropdownRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const selectedLabel =
    options.find((o) => o.value === value)?.label ?? placeholder;

  /* Trigger — matches GlassButton secondary exactly */
  const triggerStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
    background: "var(--bg-secondary)",
    color: value ? "var(--text-primary)" : "var(--text-tertiary)",
    border: "1px solid var(--border-color)",
    borderRadius: radii.md,
    padding: String(space[2]) + "px " + String(space[4]) + "px",
    fontSize: fontSizes.sm,
    fontWeight: 500,
    cursor: disabled ? "not-allowed" : "pointer",
    width: fullWidth ? (width ?? "100%") : width ?? "auto",
    outline: "none",
    userSelect: "none",
    backdropFilter: "blur(15px)",
    WebkitBackdropFilter: "blur(15px)",
    transition: "all var(--transition-fast) ease",
    opacity: disabled ? 0.5 : 1,
    boxShadow: open ? "0 0 0 3px var(--accent-bg)" : "none",
  };

  /* Dropdown panel — portals to body, fixed positioning */
  const dropdownStyle: React.CSSProperties = {
    position: "fixed",
    top: dropdownPos.top,
    left: dropdownPos.left,
    width: dropdownPos.width,
    zIndex: zLayers.tooltip,
    background: "var(--bg-elevated)",
    backdropFilter: "blur(45px) saturate(2.0)",
    WebkitBackdropFilter: "blur(45px) saturate(2.0)",
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

  const dropdownMenu = (
    <motion.div
      ref={dropdownRef}
      variants={{
        hidden: { opacity: 0, y: -4, scale: 0.96 },
        visible: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: -4, scale: 0.96 },
      }}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={dropdownTransition}
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
  );

  return (
    <>
      <div
        ref={triggerRef}
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
          transition={dropdownTransition}
          style={{ flexShrink: 0, display: "flex", color: "var(--text-tertiary)" }}
        >
          <ChevronDown size={14} />
        </motion.span>
      </div>

      {createPortal(
        <AnimatePresence>
          {open && dropdownMenu}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}

export default GlassSelect;
