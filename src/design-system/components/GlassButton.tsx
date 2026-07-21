/**
 * GlassButton — Liquid Glass Button
 *
 * Apple-style button with glass material support.
 * Replaces CSS-class-based buttons (btn-primary, btn-secondary, btn-danger, btn-icon)
 * with a unified component backed by design-system tokens.
 *
 * Variants:
 *   primary  — accent-filled, white text
 *   secondary — glass surface, border
 *   danger   — danger-filled, white text
 *   ghost    — transparent, for icon buttons and toolbars
 *   input    — input-field style, for select-like buttons
 */

import { forwardRef, type ReactNode } from "react";
import { motion, type HTMLMotionProps, type TargetAndTransition } from "framer-motion";
import { springSnappy, glassPress, glassGhostHover } from "../animations";
import { space, radii, fontSizes } from "../tokens";

export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost" | "input";
export type ButtonSize = "sm" | "md" | "lg";

export interface GlassButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  children?: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Render as inline-flex; defaults to true */
  inline?: boolean;
  /** Disable spring animation on tap */
  noAnimation?: boolean;
}

const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
  sm:  { padding: String(space[1]) + "px " + String(space[3]) + "px", fontSize: fontSizes.xs, borderRadius: radii.sm },
  md:  { padding: String(space[2]) + "px " + String(space[4]) + "px", fontSize: fontSizes.sm, borderRadius: radii.md },
  lg:  { padding: String(space[3]) + "px " + String(space[5]) + "px", fontSize: fontSizes.md, borderRadius: radii.md },
};

function variantBase(variant: ButtonVariant): React.CSSProperties {
  switch (variant) {
    case "primary":
      return {
        background: "var(--accent)",
        color: "white",
        border: "none",
        fontWeight: 500,
        boxShadow: "0 2px 8px rgba(99,102,241,0.25)",
      };
    case "secondary":
      return {
        background: "var(--bg-secondary)",
        color: "var(--text-primary)",
        border: "1px solid var(--border-color)",
        fontWeight: 500,
        backdropFilter: "blur(15px)",
        WebkitBackdropFilter: "blur(15px)",
      };
    case "danger":
      return {
        background: "var(--danger)",
        color: "white",
        border: "none",
        fontWeight: 500,
        boxShadow: "0 2px 8px rgba(231,76,60,0.25)",
      };
    case "ghost":
      return {
        background: "transparent",
        color: "var(--text-secondary)",
        border: "none",
        backdropFilter: "none",
        WebkitBackdropFilter: "none",
      };
    case "input":
      return {
        background: "var(--bg-tertiary)",
        color: "var(--text-primary)",
        border: "1px solid var(--border-color)",
        fontSize: fontSizes.sm,
        borderRadius: radii.md,
        padding: String(space[2]) + "px " + String(space[4]) + "px",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      };
    default:
      return {};
  }
}

function hoverTarget(variant: ButtonVariant): TargetAndTransition | undefined {
  switch (variant) {
    case "primary":
      return {
        background: "var(--accent-hover)",
        boxShadow: "0 4px 16px rgba(99,102,241,0.35)",
      };
    case "secondary":
      return {
        background: "var(--bg-elevated)",
        borderColor: "var(--border-strong)",
        boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
      };
    case "danger":
      return {
        filter: "brightness(1.15)",
        boxShadow: "0 4px 16px rgba(231,76,60,0.35)",
      };
    case "ghost":
      return {
        background: "var(--bg-tertiary)",
        color: "var(--text-primary)",
      };
    case "input":
      return {
        borderColor: "var(--accent)",
        boxShadow: "0 0 0 3px var(--accent-bg)",
      };
    default:
      return undefined;
  }
}

function disabledStyle(): React.CSSProperties {
  return {
    opacity: 0.5,
    cursor: "not-allowed",
    transform: "none",
    boxShadow: "none",
  };
}

export const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
  function GlassButton(
    {
      children,
      variant = "secondary",
      size = "md",
      inline = true,
      noAnimation = false,
      disabled,
      style,
      ...rest
    },
    ref
  ) {
    const composedStyle: React.CSSProperties = {
      display: inline ? "inline-flex" : "flex",
      alignItems: "center",
      gap: 6,
      cursor: disabled ? "not-allowed" : "pointer",
      transition: "all var(--transition-fast) ease",
      willChange: "transform",
      ...sizeStyles[size],
      ...variantBase(variant),
      ...(disabled ? disabledStyle() : {}),
      ...(style as React.CSSProperties),
    };

    return (
      <motion.button
        ref={ref}
        disabled={disabled}
        style={composedStyle}
        whileHover={
          noAnimation || disabled
            ? undefined
            : variant === "ghost"
              ? glassGhostHover.whileHover
              : hoverTarget(variant)
        }
        whileTap={
          noAnimation || disabled
            ? undefined
            : { ...glassPress.whileTap }
        }
        transition={springSnappy}
        {...rest}
      >
        {children}
      </motion.button>
    );
  }
);

export default GlassButton;
