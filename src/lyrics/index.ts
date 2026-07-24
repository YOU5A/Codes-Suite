/**
 * Lyrics Module — 统一导出
 *
 * @module lyrics
 */

export { parseLyrics, detectSource } from "./LyricParser";
export { useLyricManager } from "./LyricManager";
export { computeLyricRender } from "./LyricRenderer";
export { default as LyricWindow } from "./LyricWindow";
export { default as LyricDisplay } from "./LyricDisplay";
export { useLyricScroller } from "./useLyricScroller";
export type { UseLyricScrollerOptions, UseLyricScrollerReturn } from "./useLyricScroller";
export type {
  LyricLine,
  LyricData,
  LyricSource,
  LyricWindowState,
} from "./types";
export type { LyricManagerState } from "./LyricManager";
export type { LyricRenderContext } from "./LyricRenderer";
