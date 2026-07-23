/**
 * Lyrics Module — Core Type Definitions
 *
 * @module lyrics/types
 */

/** 单行歌词 */
export interface LyricLine {
  time: number; // 秒
  text: string;
}

/** 完整歌词数据（统一格式） */
export interface LyricData {
  title: string;
  artist: string;
  lines: LyricLine[];
}

/** 歌词来源 */
export type LyricSource = "lrc" | "ttml" | "qrc" | "yrc" | "unknown";

/** 歌词窗口状态 */
export interface LyricWindowState {
  visible: boolean;
  x: number;
  y: number;
}
