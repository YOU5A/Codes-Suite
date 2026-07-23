/**
 * LyricDisplay ? Apple Music style lyrics rendering
 *
 * Uses CSS transform translateY for smooth, GPU-accelerated scrolling.
 * Current line is always centered. Manual scroll pauses auto-follow for 3s.
 */

import { useRef, useEffect, useMemo, useState, useCallback } from "react";
import type { LyricData, LyricLine } from "./types";

interface LyricDisplayProps {
  lyricData: LyricData | null;
  currentTime: number;
  loading?: boolean;
  error?: string | null;
  loadingText?: string;
  noLyricsText?: string;
  instrumentalText?: string;
  onLineClick?: (time: number) => void;
}

const ROW_HEIGHT = 64;

/** AMLL-inspired easing */
const TRANSITION = "transform 0.6s cubic-bezier(0.25, 0.1, 0.25, 1.0)";

export default function LyricDisplay({
  lyricData, currentTime, loading, error,
  loadingText, noLyricsText, instrumentalText,
  onLineClick,
}: LyricDisplayProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerH, setContainerH] = useState(300);
  const [manualOffset, setManualOffset] = useState(0);
  const [isManual, setIsManual] = useState(false);
  const manualTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isManualRef = useRef(false);
  const pressStartTime = useRef(0);
  const touchStartY = useRef(0);
  const touchStartOffset = useRef(0);
  // Remember last valid auto-offset to avoid jump-to-top on song transitions
  const lastAutoOffsetRef = useRef(0);

  // Measure container height for spacer calculation
  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        setContainerH(containerRef.current.clientHeight);
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const spacerH = containerH / 2 - ROW_HEIGHT / 2;

  const { currentIndex, lineProgress, allLines } = useMemo(() => {
    if (!lyricData?.lines?.length) {
      lastAutoOffsetRef.current = 0;
      return { currentIndex: -1, lineProgress: 0, allLines: [] as LyricLine[] };
    }
    const lines = lyricData.lines;
    let idx = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].time <= currentTime) idx = i;
      else break;
    }
    let prog = 0;
    if (idx >= 0 && idx < lines.length - 1) {
      const dur = lines[idx + 1].time - lines[idx].time;
      if (dur > 0) prog = Math.min(1, (currentTime - lines[idx].time) / dur);
    }
    return { currentIndex: idx, lineProgress: prog, allLines: lines };
  }, [lyricData, currentTime]);

  // Auto-scroll: offset to center current line
  // Spacer = containerH/2 - ROW_HEIGHT/2, so line i centers at offset = -(i * ROW_HEIGHT)
  const autoOffset = useMemo(() => {
    if (currentIndex < 0) return lastAutoOffsetRef.current;
    const raw = -(currentIndex * ROW_HEIGHT);
    const maxO = 0;
    const minO = allLines.length > 0 ? -((allLines.length - 1) * ROW_HEIGHT) : 0;
    const val = Math.max(minO, Math.min(maxO, raw));
    lastAutoOffsetRef.current = val;
    return val;
  }, [currentIndex, allLines.length]);

  // Sync isManual state to ref for use in non-reactive callbacks
  useEffect(() => { isManualRef.current = isManual; }, [isManual]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartY.current = e.touches[0].clientY;
      // Use current visual offset as touch base (manual if active, auto otherwise)
      touchStartOffset.current = isManual ? manualOffset : autoOffset;
    }
  }, [isManual, manualOffset, autoOffset]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsManual(true);
      isManualRef.current = true;
      const dy = e.touches[0].clientY - touchStartY.current;
      const clamped = Math.max(minOffset, Math.min(maxOffset, touchStartOffset.current + dy));
      setManualOffset(clamped);
      if (manualTimer.current) clearTimeout(manualTimer.current);
      manualTimer.current = setTimeout(() => { setIsManual(false); isManualRef.current = false; }, 3000);
    }
  }, []);

  useEffect(() => {
    return () => { if (manualTimer.current) clearTimeout(manualTimer.current); };
  }, []);

  // Accumulated manual scroll offset (ref avoids stale closure issues)
  const manualBaseRef = useRef(0);
  // Keep autoOffset in a ref so wheel handler always sees latest value
  const autoOffsetRef = useRef(autoOffset);
  autoOffsetRef.current = autoOffset;

  // Scroll bounds: first line centered (0) to last line centered
  const maxOffset = 0;
  const minOffset = allLines.length > 0 ? -((allLines.length - 1) * ROW_HEIGHT) : 0;

  function clampOffset(v: number) {
    return Math.max(minOffset, Math.min(maxOffset, v));
  }

  // Non-passive wheel listener for preventDefault support
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (!isManualRef.current) {
        // Entering manual mode: start from current auto position (clamped)
        manualBaseRef.current = clampOffset(autoOffsetRef.current);
      }
      manualBaseRef.current = clampOffset(manualBaseRef.current - e.deltaY);
      setManualOffset(manualBaseRef.current);
      setIsManual(true);
      isManualRef.current = true;
      if (manualTimer.current) clearTimeout(manualTimer.current);
      manualTimer.current = setTimeout(() => { setIsManual(false); isManualRef.current = false; }, 3000);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const offset = isManual ? manualOffset : autoOffset;

  const cs: React.CSSProperties = {
    height: "100%", display: "flex", alignItems: "center",
    justifyContent: "center", textAlign: "center", padding: "0 16px",
  };

  if (loading) {
    return <div style={cs}><span style={{ fontSize: 13, color: "var(--text-tertiary)" }}>{loadingText || "\u52A0\u8F7D\u4E2D..."}</span></div>;
  }
  if (error) {
    return <div style={cs}><span style={{ fontSize: 13, color: "var(--text-tertiary)" }}>{error}</span></div>;
  }
  if (!lyricData || !allLines.length) {
    return <div style={cs}><span style={{ fontSize: 13, color: "var(--text-tertiary)" }}>{noLyricsText || "\u6682\u65E0\u6B4C\u8BCD"}</span></div>;
  }
  if (!allLines.some(l => l.text.trim())) {
    return <div style={cs}><span style={{ fontSize: 13, color: "var(--text-tertiary)" }}>{instrumentalText || "\u7EAF\u97F3\u4E50\uFF0C\u8BF7\u6B23\u8D4F"}</span></div>;
  }

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      style={{
        height: "100%", overflow: "hidden", position: "relative", touchAction: "none",
        maskImage: "linear-gradient(to bottom, transparent 0%, black 8%, black 88%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 8%, black 88%, transparent 100%)",
      }}
    >
      <div
        style={{
          transform: `translateY(${offset}px)`,
          transition: isManual ? "none" : TRANSITION,
          willChange: "transform",
        }}
      >
        <div style={{ height: spacerH, flexShrink: 0 }} />

        {allLines.map((line, i) => {
          const isCurrent = i === currentIndex;
          const dist = Math.abs(i - currentIndex);
          // Manual scroll: brighter non-current lines for readability
          // Auto playback: semi-transparent blur for ambiance
          const base = isManual ? 0.65 : 0.5;
          const minOp = isManual ? 0.25 : 0.08;
          const opacity = isCurrent ? 1 : Math.max(minOp, base - dist * 0.11);

          return (
            <div
              key={i}
              onMouseDown={onLineClick ? () => { pressStartTime.current = Date.now(); } : undefined}
              onMouseUp={onLineClick ? () => {
                if (Date.now() - pressStartTime.current < 200) {
                  onLineClick(line.time);
                  setIsManual(false);
                  isManualRef.current = false;
                  if (manualTimer.current) { clearTimeout(manualTimer.current); manualTimer.current = null; }
                }
              } : undefined}
              onMouseMove={(e) => {
                const el = e.currentTarget;
                const r = el.getBoundingClientRect();
                el.style.setProperty("--lx", ((e.clientX - r.left) / r.width * 100) + "%");
                el.style.setProperty("--ly", ((e.clientY - r.top) / r.height * 100) + "%");
                el.style.setProperty("--lo", "1");
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                const r = el.getBoundingClientRect();
                el.style.setProperty("--lx", ((e.clientX - r.left) / r.width * 100) + "%");
                el.style.setProperty("--ly", ((e.clientY - r.top) / r.height * 100) + "%");
                el.style.setProperty("--lo", "1");
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.setProperty("--lo", "0");
              }}
              style={{
                minHeight: ROW_HEIGHT,
                display: "flex", alignItems: "center", justifyContent: "center",
                textAlign: "center",
                fontSize: isCurrent ? 17 : 13,
                fontWeight: isCurrent ? 700 : 400,
                lineHeight: 1.5,
                color: isCurrent ? "var(--text-primary)" : "var(--text-tertiary)",
                opacity,
                padding: "4px 12px",
                transition: "font-size 0.35s ease, font-weight 0.35s ease, color 0.35s ease, opacity 0.35s ease",
                cursor: onLineClick ? "pointer" : "default", userSelect: "none",
                textShadow: isCurrent ? "0 0 14px rgba(var(--accent-rgb), 0.35)" : "none",
                position: "relative",
                overflowWrap: "break-word", wordBreak: "break-word",
              }}
            >
              {/* Cursor-following glow */}
              <span
                aria-hidden="true"
                style={{
                  position: "absolute", inset: 0, pointerEvents: "none",
                  background: "radial-gradient(300px circle at var(--lx, 50%) var(--ly, 50%), rgba(255,255,255,0.10), transparent 60%)",
                  opacity: "var(--lo, 0)",
                  transition: "opacity 0.3s ease-out",
                }}
              />
              <span style={{ position: "relative", zIndex: 1 }}>{line.text}</span>
            </div>
          );
        })}

        <div style={{ height: spacerH, flexShrink: 0 }} />
      </div>
    </div>
  );
}
