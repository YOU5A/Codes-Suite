/**
 * Lyrics Module — Core Type Definitions
 *
 * @module lyrics/types
 */

/** 单行歌词 */
export interface LyricLine {
  time: number; // 秒
  text: string;
  /** 是否为间奏行（由解析器自动生成，用于显示等待点动画） */
  isInterlude?: boolean;
  /** 间奏持续时间（秒），仅 isInterlude 时有效 */
  duration?: number;
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
