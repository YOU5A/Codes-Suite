/**
 * useLyricScroller — 歌词滚动逻辑 Hook
 *
 * 封装所有滚动行为，LyricDisplay 只管渲染。
 * 未来修改滚动行为只需改本文件。
 *
 * @module lyrics/useLyricScroller
 */

import { useRef, useEffect, useLayoutEffect, useState, useCallback } from "react";

export interface UseLyricScrollerOptions {
  /** 当前歌词行索引（-1 表示无当前行） */
  currentIndex: number;
  /** 行高基准（用于 spacer 计算），默认 64 */
  rowHeight?: number;
  /** 歌曲标识，变化时重置滚动位置到顶部并退出手动模式 */
  resetKey?: string | number;
}

export interface UseLyricScrollerReturn {
  /** 滚动容器的 ref */
  containerRef: React.RefObject<HTMLDivElement | null>;
  /** 为每行生成 callback ref */
  setRowRef: (i: number) => (el: HTMLDivElement | null) => void;
  /** 容器高度（用于 spacer） */
  containerH: number;
  /** 顶部/底部 spacer 高度 */
  spacerH: number;
  /** 是否处于手动浏览模式 */
  isManual: boolean;
  /** touch 事件处理（直接 spread 到容器上） */
  touchHandlers: {
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
  };
}

/**
 * 歌词滚动控制器
 *
 * - 自动跟随 currentIndex（平滑滚动）
 * - 首次挂载 / 重新打开时瞬间定位
 * - 鼠标滚轮 / 触屏手动浏览，3 秒无操作自动恢复
 */
export function useLyricScroller(
  options: UseLyricScrollerOptions
): UseLyricScrollerReturn {
  const { currentIndex, rowHeight = 64, resetKey } = options;

  // ── Refs ──
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rowRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const manualTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isManualRef = useRef(false);
  const currentIndexRef = useRef(currentIndex);
  const prevIndexRef = useRef(-1);
  const touchStartY = useRef(0);
  const touchStartScroll = useRef(0);

  // Keep refs in sync
  currentIndexRef.current = currentIndex;

  // ── Reset on song change ──
  const prevResetKey = useRef(resetKey);
  useEffect(() => {
    if (resetKey !== undefined && resetKey !== prevResetKey.current) {
      prevResetKey.current = resetKey;
      // Exit manual mode
      setIsManual(false);
      isManualRef.current = false;
      if (manualTimer.current) {
        clearTimeout(manualTimer.current);
        manualTimer.current = null;
      }
      // Reset scroll position to top
      if (containerRef.current) {
        containerRef.current.scrollTo({ top: 0, behavior: "auto" });
      }
      // Reset prevIndex so next auto-scroll is instant
      prevIndexRef.current = -1;
    }
  }, [resetKey]);

  // ── State ──
  const [containerH, setContainerH] = useState(0);
  const [isManual, setIsManual] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Sync isManual to ref
  useEffect(() => { isManualRef.current = isManual; }, [isManual]);

  // ── Container measurement ──
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => setContainerH(el.clientHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // ── Scroll to line ──
  const scrollToLine = useCallback((index: number, smooth: boolean) => {
    const container = containerRef.current;
    const row = rowRefs.current.get(index);
    if (!container || !row) return;
    const ch = container.clientHeight;
    const target = row.offsetTop - ch / 2 + row.offsetHeight / 2;
    container.scrollTo({ top: target, behavior: smooth ? "smooth" : "auto" });
  }, []);

  // ── Auto-scroll on currentIndex change ──
  useLayoutEffect(() => {
    if (currentIndex < 0) return;
    if (isManualRef.current) return;
    const smooth = prevIndexRef.current !== -1;
    prevIndexRef.current = currentIndex;
    scrollToLine(currentIndex, smooth);
  }, [currentIndex, scrollToLine]);

  // ── Mount / reopen instant scroll ──
  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (!mounted || currentIndex < 0 || isManual) return;
    const t = setTimeout(() => scrollToLine(currentIndex, false), 16);
    return () => clearTimeout(t);
  }, [mounted]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Start manual mode (shared by wheel & touch) ──
  const enterManualMode = useCallback(() => {
    setIsManual(true);
    isManualRef.current = true;
    if (manualTimer.current) clearTimeout(manualTimer.current);
    manualTimer.current = setTimeout(() => {
      setIsManual(false);
      isManualRef.current = false;
      const idx = currentIndexRef.current;
      if (idx >= 0) scrollToLine(idx, true);
      manualTimer.current = null;
    }, 3000);
  }, [scrollToLine]);

  // ── Wheel scroll ──
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      el.scrollTop += e.deltaY;
      enterManualMode();
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
      if (manualTimer.current) {
        clearTimeout(manualTimer.current);
        manualTimer.current = null;
      }
    };
  }, [enterManualMode]);

  // ── Touch scroll ──
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    touchStartY.current = e.touches[0].clientY;
    touchStartScroll.current = containerRef.current?.scrollTop ?? 0;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length !== 1 || !containerRef.current) return;
    const dy = touchStartY.current - e.touches[0].clientY;
    containerRef.current.scrollTop = touchStartScroll.current + dy;
    enterManualMode();
  }, [enterManualMode]);

  // ── Cleanup ──
  useEffect(() => {
    return () => {
      if (manualTimer.current) {
        clearTimeout(manualTimer.current);
        manualTimer.current = null;
      }
    };
  }, []);

  // ── Spacer ──
  const spacerH = containerH > 0 ? containerH / 2 - rowHeight / 2 : 150;

  return {
    containerRef,
    setRowRef: (i: number) => (el: HTMLDivElement | null) => {
      if (el) rowRefs.current.set(i, el);
      else rowRefs.current.delete(i);
    },
    containerH,
    spacerH,
    isManual,
    touchHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
    },
  };
}
