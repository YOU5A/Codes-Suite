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
}

const ROW_HEIGHT = 44;

/** AMLL-inspired easing */
const TRANSITION = "transform 0.6s cubic-bezier(0.25, 0.1, 0.25, 1.0)";

export default function LyricDisplay({
  lyricData, currentTime, loading, error,
  loadingText, noLyricsText, instrumentalText,
}: LyricDisplayProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerH, setContainerH] = useState(300);
  const [manualOffset, setManualOffset] = useState(0);
  const [isManual, setIsManual] = useState(false);
  const manualTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartY = useRef(0);
  const touchStartOffset = useRef(0);

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
    if (currentIndex < 0) return 0;
    return -(currentIndex * ROW_HEIGHT);
  }, [currentIndex]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setIsManual(true);
    setManualOffset(prev => prev - e.deltaY);
    if (manualTimer.current) clearTimeout(manualTimer.current);
    manualTimer.current = setTimeout(() => setIsManual(false), 3000);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartY.current = e.touches[0].clientY;
      touchStartOffset.current = manualOffset;
    }
  }, [manualOffset]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsManual(true);
      const dy = e.touches[0].clientY - touchStartY.current;
      setManualOffset(touchStartOffset.current + dy);
      if (manualTimer.current) clearTimeout(manualTimer.current);
      manualTimer.current = setTimeout(() => setIsManual(false), 3000);
    }
  }, []);

  useEffect(() => {
    return () => { if (manualTimer.current) clearTimeout(manualTimer.current); };
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
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      style={{ height: "100%", overflow: "hidden", position: "relative" }}
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
          const opacity = isCurrent ? 1 : Math.max(0.08, 0.5 - dist * 0.11);

          return (
            <div
              key={i}
              style={{
                height: ROW_HEIGHT,
                display: "flex", alignItems: "center", justifyContent: "center",
                textAlign: "center",
                fontSize: isCurrent ? 17 : 13,
                fontWeight: isCurrent ? 700 : 400,
                color: isCurrent ? "var(--text-primary)" : "var(--text-tertiary)",
                opacity,
                padding: "0 12px",
                transition: "font-size 0.35s ease, font-weight 0.35s ease, color 0.35s ease, opacity 0.35s ease",
                cursor: "default", userSelect: "none",
                textShadow: isCurrent ? "0 0 14px rgba(var(--accent-rgb), 0.35)" : "none",
              }}
            >
              {line.text}
            </div>
          );
        })}

        <div style={{ height: spacerH, flexShrink: 0 }} />
      </div>
    </div>
  );
}
