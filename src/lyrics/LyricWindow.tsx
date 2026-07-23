/**
 * LyricWindow ? Draggable lyrics overlay with macOS traffic light close button.
 */

import { useState, useRef, useCallback, useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { GlassSurface } from "@/design-system";
import { glassPopIn } from "@/design-system";
import { zLayers } from "@/design-system";

interface LyricWindowProps {
  open: boolean;
  onClose: () => void;
  children?: ReactNode;
}

const POS_KEY = "lyrics-window-position";
const WIN_WIDTH = 280;
const WIN_HEIGHT = 340;

function loadPosition(): { x: number; y: number } {
  try {
    const raw = localStorage.getItem(POS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { x: 24, y: window.innerHeight - WIN_HEIGHT - 20 };
}

function savePosition(x: number, y: number) {
  try { localStorage.setItem(POS_KEY, JSON.stringify({ x, y })); } catch {}
}

/* ??? macOS Traffic Light Red Dot ??? */
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
        position: "relative",
        boxShadow: "0 0 0 0.5px rgba(0,0,0,0.12), inset 0 1px 0.5px rgba(255,255,255,0.3), inset 0 -0.5px 1px rgba(0,0,0,0.08)",
        transition: "background 0.15s ease",
        outline: "none",
      }}
    >
      {/* X icon on hover */}
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

export default function LyricWindow({ open, onClose, children }: LyricWindowProps) {
  const [pos, setPos] = useState(loadPosition);
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onResize = () => {
      setPos(prev => ({
        x: Math.min(prev.x, window.innerWidth - WIN_WIDTH),
        y: Math.min(prev.y, window.innerHeight - 60),
      }));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    dragging.current = true;
    offset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    e.preventDefault();
  }, [pos]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      setPos({
        x: Math.max(0, Math.min(e.clientX - offset.current.x, window.innerWidth - WIN_WIDTH)),
        y: Math.max(0, Math.min(e.clientY - offset.current.y, window.innerHeight - 60)),
      });
    };
    const onUp = () => {
      if (dragging.current) {
        dragging.current = false;
        setPos(p => { savePosition(p.x, p.y); return p; });
      }
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

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
            position: "fixed", left: pos.x, top: pos.y,
            zIndex: zLayers.overlay, width: WIN_WIDTH, height: WIN_HEIGHT,
          }}
        >
          <GlassSurface
            tier="regular"
            onMouseDown={handleMouseDown}
            style={{
              padding: "10px 12px 0",
              display: "flex", flexDirection: "column",
              borderRadius: 16, overflow: "hidden",
              height: "100%", cursor: "grab", position: "relative",
              background: "rgba(28, 28, 30, 0.55)",
            } as React.CSSProperties}
          >
            {/* Traffic light close dot + spacer */}
            <div style={{ display: "flex", alignItems: "center", height: 20, flexShrink: 0 }}>
              <CloseDot onClick={onClose} />
            </div>

            {/* Content ? masked, no overflow scroll (transform driven) */}
            <div style={{
              flex: 1, overflow: "hidden",
              maskImage: "linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)",
              WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)",
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
