/**
 * GlassInput — Liquid Glass Input Field
 *
 * Replaces .input-field CSS class. Supports text inputs,
 * textareas, and wrapped select elements.
 *
 * Uses ultraThin glass tier for the input background.
 * Focus state uses glassFocusRing animation for Apple-style glow.
 */

import { forwardRef, type ReactNode } from "react";
import type { HTMLMotionProps } from "framer-motion";
import { motion } from "framer-motion";
import { glassFocusRing, glassFocusRingOut } from "../animations";
import { space, radii, fontSizes } from "../tokens";

export interface GlassInputProps extends Omit<HTMLMotionProps<"input">, "children"> {
  children?: ReactNode;
  /** Input type: text, textarea, or select (renders as wrapper) */
  as?: "input" | "textarea" | "select";
  /** Error state styling */
  error?: boolean;
  /** Full width (default: true) */
  fullWidth?: boolean;
}

const baseInputStyle: React.CSSProperties = {
  background: "var(--bg-tertiary)",
  color: "var(--text-primary)",
  border: "1px solid var(--border-color)",
  borderRadius: radii.lg,
  padding: String(space[2]) + "px " + String(space[4]) + "px",
  fontSize: fontSizes.sm,
  outline: "none",
  transition: "all var(--transition-fast) ease",
  width: "100%",
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
};

const errorFocusStyle = {
  borderColor: "var(--danger)",
  boxShadow: "0 0 0 3px rgba(255,59,48,0.12)",
};

export const GlassInput = forwardRef<HTMLInputElement | HTMLTextAreaElement, GlassInputProps>(
  function GlassInput(
    {
      as = "input",
      error = false,
      fullWidth = true,
      style,
      children,
      ...rest
    },
    ref
  ) {
    const composedStyle: React.CSSProperties = {
      ...baseInputStyle,
      ...(error
        ? { borderColor: "var(--danger)", boxShadow: "0 0 0 3px rgba(255,59,48,0.12)" }
        : {}),
      ...(fullWidth ? {} : { width: undefined }),
      ...(as === "textarea" ? { resize: "vertical", minHeight: 80 } : {}),
      ...(style as React.CSSProperties),
    };

    // Input/textarea: use motion.input or motion.textarea
    if (as === "textarea") {
      return (
        <motion.textarea
          ref={ref as any}
          style={composedStyle}
          whileFocus={error ? errorFocusStyle : glassFocusRing}
          {...(rest as any)}
        />
      );
    }

    if (as === "select") {
      // Select wrapper for child <select> elements
      return (
        <motion.div
          style={{
            ...composedStyle,
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
            appearance: "none" as any,
          }}
        >
          {children}
        </motion.div>
      );
    }

    // Default: input
    return (
      <motion.input
        ref={ref as any}
        style={composedStyle}
        whileFocus={error ? errorFocusStyle : glassFocusRing}
        {...(rest as any)}
      />
    );
  }
);

export default GlassInput;
