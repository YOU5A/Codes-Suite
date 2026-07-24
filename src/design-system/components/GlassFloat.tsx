/**
 * GlassFloat — Draggable floating glass window.
 *
 * Reusable floating window primitive with backdrop-filter blur,
 * macOS traffic-light close button, optional title, drag-to-move,
 * and position persistence.
 *
 * backdrop-filter lives on the outer container (not inside GlassSurface)
 * to avoid stacking-context clipping by will-change:transform.
 */

import { useState, useRef, useCallback, useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { GlassSurface } from "./GlassSurface";
import { glassPopIn } from "../animations";
import { zLayers } from "../tokens";
import { useTheme } from "@/hooks/useTheme";

export interface GlassFloatProps {
  open: boolean;
  onClose: () => void;
  children?: ReactNode;
  title?: string;
  width?: number;
  height?: number;
  /** localStorage key for persisting window position. Omit to not persist. */
  positionKey?: string;
  /** Default position when no saved position exists. */
  defaultPosition?: { x: number; y: number };
}

/* ─── macOS Traffic Light Close Dot ─── */
function CloseDot({ onClick }: { onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  const DOT = 12;
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label="Close"
      style={{
        width: DOT, height: DOT, minWidth: DOT, minHeight: DOT,
        borderRadius: "50%", border: "none", padding: 0,
        cursor: "default",
        background: "#FF5F57",
        position: "relative", flexShrink: 0,
        boxShadow: "0 0 0 0.5px rgba(0,0,0,0.12), inset 0 1px 0.5px rgba(255,255,255,0.3), inset 0 -0.5px 1px rgba(0,0,0,0.08)",
        transition: "background 0.15s ease",
        outline: "none",
      }}
    >
      <span style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        opacity: hovered ? 1 : 0,
        transition: "opacity 0.12s ease",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <svg width="6" height="6" viewBox="0 0 6 6" fill="none" stroke="#5B0000" strokeWidth="1.2" strokeLinecap="round">
          <line x1="1" y1="1" x2="5" y2="5" />
          <line x1="5" y1="1" x2="1" y2="5" />
        </svg>
      </span>
    </button>
  );
}

export function GlassFloat({
  open, onClose, children, title,
  width = 280, height = 340,
  positionKey, defaultPosition,
}: GlassFloatProps) {
  const { settings } = useTheme();

  const loadPos = useCallback((): { x: number; y: number } => {
    if (positionKey) {
      try {
        const raw = localStorage.getItem(positionKey);
        if (raw) return JSON.parse(raw);
      } catch {}
    }
    if (defaultPosition) return defaultPosition;
    return { x: 24, y: window.innerHeight - height - 20 };
  }, [positionKey, defaultPosition, height]);

  const savePos = useCallback((x: number, y: number) => {
    if (!positionKey) return;
    try { localStorage.setItem(positionKey, JSON.stringify({ x, y })); } catch {}
  }, [positionKey]);

  const [pos, setPos] = useState(loadPos);
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });
  const rafRef = useRef(0);

  useEffect(() => {
    const onResize = () => {
      setPos(prev => ({
        x: Math.min(prev.x, window.innerWidth - width),
        y: Math.min(prev.y, window.innerHeight - height),
      }));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [width, height]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    dragging.current = true;
    offset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    e.preventDefault();
  }, [pos]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = 0;
        if (!dragging.current) return;
        setPos({
          x: Math.max(0, Math.min(e.clientX - offset.current.x, window.innerWidth - width)),
          y: Math.max(0, Math.min(e.clientY - offset.current.y, window.innerHeight - height)),
        });
      });
    };
    const onUp = () => {
      if (dragging.current) {
        dragging.current = false;
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = 0;
        }
        setPos(p => { savePos(p.x, p.y); return p; });
      }
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [width, height, savePos]);

  const content = (
    <AnimatePresence>
      {open && (
        <motion.div
          variants={glassPopIn}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ type: "spring", stiffness: 200, damping: 24, mass: 0.8 }}
          style={{
            position: "fixed",
            left: pos.x, top: pos.y,
            zIndex: zLayers.overlay,
            width, height,
            borderRadius: settings.borderRadius,
            overflow: "hidden",
            backdropFilter: "blur(45px) saturate(2.0)",
            WebkitBackdropFilter: "blur(45px) saturate(2.0)",
            willChange: "transform",
          }}
        >
          <GlassSurface
            tier="elevated"
            onMouseDown={handleMouseDown}
            style={{
              padding: "10px 12px 0",
              display: "flex", flexDirection: "column",
              borderRadius: settings.borderRadius,
              height: "100%", cursor: "grab",
              position: "relative",
            } as React.CSSProperties}
          >
            {/* Title bar */}
            <div style={{
              display: "flex", alignItems: "center",
              height: 20, flexShrink: 0, position: "relative",
              marginBottom: title ? 0 : undefined,
            }}>
              <CloseDot onClick={onClose} />
              {title && (
                <span style={{
                  position: "absolute", left: "50%", transform: "translateX(-50%)",
                  fontSize: 11, fontWeight: 500, color: "var(--text-secondary)",
                  letterSpacing: "0.05em", userSelect: "none", pointerEvents: "none",
                }}>
                  {title}
                </span>
              )}
            </div>

            {/* Content */}
            <div style={{
              flex: 1, overflow: "hidden",
              borderRadius: `0 0 ${settings.borderRadius}px ${settings.borderRadius}px`,
            }}>
              {children}
            </div>
          </GlassSurface>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(content, document.body);
}

export default GlassFloat;