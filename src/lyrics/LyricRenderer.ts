/**
 * LyricRenderer — 歌词渲染工具
 *
 * 根据当前播放时间计算当前行、附近行、高亮状态。
 * 本身不渲染 DOM，只提供数据给 LyricWindow。
 *
 * @module lyrics/LyricRenderer
 */

import type { LyricData, LyricLine } from "./types";

export interface LyricRenderContext {
  /** 当前行 */
  current: LyricLine | null;
  /** 当前行索引 */
  currentIndex: number;
  /** 前 N 行（用于渐入） */
  prevLines: LyricLine[];
  /** 后 N 行（用于渐出） */
  nextLines: LyricLine[];
  /** 所有行 */
  allLines: LyricLine[];
  /** 当前行进度 0~1（同一行内的插值进度） */
  lineProgress: number;
}

/**
 * 根据当前时间和歌词数据计算渲染上下文
 * @param data 歌词数据
 * @param currentTime 当前播放秒数
 * @param lookBehind 当前行之前显示的行数
 * @param lookAhead 当前行之后显示的行数
 */
export function computeLyricRender(
  data: LyricData | null,
  currentTime: number,
  lookBehind = 3,
  lookAhead = 5
): LyricRenderContext {
  if (!data || !data.lines.length) {
    return {
      current: null,
      currentIndex: -1,
      prevLines: [],
      nextLines: [],
      allLines: [],
      lineProgress: 0,
    };
  }

  const { lines } = data;
  let currentIndex = -1;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].time <= currentTime) currentIndex = i;
    else break;
  }

  const current = currentIndex >= 0 ? lines[currentIndex] : null;

  // 计算当前行内进度
  let lineProgress = 0;
  if (current && currentIndex < lines.length - 1) {
    const nextTime = lines[currentIndex + 1].time;
    const duration = nextTime - current.time;
    if (duration > 0) {
      lineProgress = Math.min(1, (currentTime - current.time) / duration);
    }
  }

  const prevLines = lines.slice(Math.max(0, currentIndex - lookBehind), currentIndex);
  const nextLines = lines.slice(currentIndex + 1, currentIndex + 1 + lookAhead);

  return {
    current,
    currentIndex,
    prevLines,
    nextLines,
    allLines: lines,
    lineProgress,
  };
}
