/**
 * LyricDisplay — Apple Music style lyrics rendering (pure UI)
 *
 * 滚动逻辑全部在 useLyricScroller hook 中，本组件只负责渲染。
 */

import { useRef, useMemo } from "react";
import type { LyricData, LyricLine } from "./types";
import { useLyricScroller } from "./useLyricScroller";
import InterludeDots from "./InterludeDots";

interface LyricDisplayProps {
  lyricData: LyricData | null;
  currentTime: number;
  loading?: boolean;
  error?: string | null;
  loadingText?: string;
  noLyricsText?: string;
  instrumentalText?: string;
  onLineClick?: (time: number) => void;
  /** 歌曲标识，变化时重置滚动位置到顶部 */
  songKey?: string;
}

const ROW_HEIGHT = 64;

export default function LyricDisplay({
  lyricData, currentTime, loading, error,
  loadingText, noLyricsText, instrumentalText,
  onLineClick,
  songKey,
}: LyricDisplayProps) {
  // ── Compute current line ──
  const { currentIndex, allLines } = useMemo(() => {
    if (!lyricData?.lines?.length) {
      return { currentIndex: -1, allLines: [] as LyricLine[] };
    }
    const lines = lyricData.lines;
    let idx = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].time <= currentTime) idx = i;
      else break;
    }
    return { currentIndex: idx, allLines: lines };
  }, [lyricData, currentTime]);

  // ── Scrolling logic (all encapsulated) ──
  const {
    containerRef,
    setRowRef,
    spacerH,
    isManual,
    touchHandlers,
  } = useLyricScroller({ currentIndex, rowHeight: ROW_HEIGHT, resetKey: songKey });

  // ── Click-vs-drag: 200ms threshold prevents seek during window drag ──
  const pressStartTime = useRef(0);

  // ── Empty / loading states ──
  var cs = {
    height: "100%", display: "flex", alignItems: "center",
    justifyContent: "center", textAlign: "center", padding: "0 16px",
  } as React.CSSProperties;

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

  // ── Render ──
  return (
    <div
      ref={containerRef}
      {...touchHandlers}
      style={{
        height: "100%",
        overflow: "hidden",
        position: "relative",
        touchAction: "none",
        maskImage: "linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)",
      }}
    >
      {/* Top spacer */}
      <div style={{ height: spacerH, flexShrink: 0 }} />

      {allLines.map((line, i) => {
        var isCurrent = i === currentIndex;
        var dist = Math.abs(i - currentIndex);
        var base = isManual ? 0.65 : 0.5;
        var minOp = isManual ? 0.25 : 0.08;
        var opacity = isCurrent ? 1 : Math.max(minOp, base - dist * 0.11);

        // ── Interlude line: render dots ──
        if (line.isInterlude) {
          return (
            <div
              key={i}
              ref={setRowRef(i)}
              data-lr={i}
              style={{
                minHeight: ROW_HEIGHT,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity,
                transition: "opacity 0.35s ease",
                pointerEvents: "none",
              }}
            >
              <InterludeDots
                line={line}
                currentTime={currentTime}
                isCurrent={isCurrent}
              />
            </div>
          );
        }

        // ── Normal lyric line ──
        return (
          <div
            key={i}
            ref={setRowRef(i)}
            data-lr={i}
            onMouseDown={onLineClick ? () => { pressStartTime.current = Date.now(); } : undefined}
            onMouseUp={onLineClick ? () => {
              if (Date.now() - pressStartTime.current < 200) {
                onLineClick(line.time);
              }
            } : undefined}
            onMouseMove={(e) => {
              var el = e.currentTarget;
              var r = el.getBoundingClientRect();
              el.style.setProperty("--lx", ((e.clientX - r.left) / r.width * 100) + "%");
              el.style.setProperty("--ly", ((e.clientY - r.top) / r.height * 100) + "%");
              el.style.setProperty("--lo", "1");
            }}
            onMouseEnter={(e) => {
              var el = e.currentTarget;
              var r = el.getBoundingClientRect();
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
              transition: "font-weight 0.35s ease, color 0.35s ease, opacity 0.35s ease",
              cursor: onLineClick ? "pointer" : "default",
              userSelect: "none",
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

      {/* Bottom spacer */}
      <div style={{ height: spacerH, flexShrink: 0 }} />
    </div>
  );
}