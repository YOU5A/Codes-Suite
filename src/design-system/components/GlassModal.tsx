/**
 * GlassModal — Liquid Glass Modal / Dialog
 *
 * Full-screen overlay with centered glass panel.
 * Uses elevated glass tier for maximum visual weight.
 * Includes backdrop blur on overlay and glass pop-in animation.
 * Rendered via React Portal to document.body for full-screen blur coverage.
 */

import { type ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import type { Transition, Variants } from "framer-motion";
import { GlassSurface } from "./GlassSurface";
import { glassPopIn } from "../animations";
import { space, zLayers } from "../tokens";

export interface GlassModalProps {
  children?: ReactNode;
  open: boolean;
  onClose?: () => void;
  maxWidth?: number | string;
  disableBackdropClose?: boolean;
  disableEscapeClose?: boolean;
  noAnimation?: boolean;
}

const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2, ease: "easeOut" as const } satisfies Transition,
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.15, ease: "easeIn" as const } satisfies Transition,
  },
};

export function GlassModal({
  children,
  open,
  onClose,
  maxWidth = 420,
  disableBackdropClose = false,
  disableEscapeClose = false,
  noAnimation = false,
}: GlassModalProps) {
  useEffect(() => {
    if (!open || disableEscapeClose) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, disableEscapeClose, onClose]);

  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [open]);

  const modalContent = (
    <AnimatePresence>
      {open && (
        <motion.div
          variants={noAnimation ? undefined : backdropVariants}
          initial={noAnimation ? undefined : "hidden"}
          animate={noAnimation ? undefined : "visible"}
          exit={noAnimation ? undefined : "exit"}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: zLayers.modal,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.35)",
            backdropFilter: "blur(12px) saturate(180%)",
            WebkitBackdropFilter: "blur(12px) saturate(180%)",
            borderRadius: "var(--radius)",
            overflow: "hidden",
          }}
          onClick={disableBackdropClose ? undefined : onClose}
        >
          <motion.div
            variants={noAnimation ? undefined : glassPopIn}
            initial={noAnimation ? undefined : "hidden"}
            animate={noAnimation ? undefined : "visible"}
            exit={noAnimation ? undefined : "exit"}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth,
              margin: space[6],
            }}
          >
            <GlassSurface
              tier="elevated"
              style={{
                padding: "28px 28px 22px",
                display: "flex",
                flexDirection: "column",
                gap: 18,
              } as React.CSSProperties}
            >
              {children}
            </GlassSurface>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}

export default GlassModal;
