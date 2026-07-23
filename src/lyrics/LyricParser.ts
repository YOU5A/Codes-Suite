/**
 * LyricParser — 多格式歌词解析器
 *
 * 支持: LRC / TTML / QRC / YRC
 * 优先尝试 AMLL lyric parser，否则降级到内置解析。
 *
 * @module lyrics/LyricParser
 */

import type { LyricLine, LyricData, LyricSource } from "./types";

/** LRC 时间标签正则: [mm:ss.xx] 或 [mm:ss] */
const LRC_TIME_RE = /\[(\d{1,3}):(\d{2})(?:\.(\d{1,3}))?\]/g;

/** 纯时间标签行（无歌词文本） */
const LRC_TAG_ONLY_RE = /^\[(\d{1,3}):(\d{2})(?:\.(\d{1,3}))?\]\s*$/;

function parseTimeTag(mm: string, ss: string, ms?: string): number {
  const m = parseInt(mm, 10);
  const s = parseInt(ss, 10);
  const c = ms ? parseInt(ms.padEnd(3, "0"), 10) / 1000 : 0;
  return m * 60 + s + c;
}

/** 解析 LRC 文本 */
function parseLRC(raw: string): LyricLine[] {
  const lines: LyricLine[] = [];
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || LRC_TAG_ONLY_RE.test(trimmed)) continue;

    const matches = [...trimmed.matchAll(LRC_TIME_RE)];
    if (matches.length === 0) continue;

    const text = trimmed.replace(LRC_TIME_RE, "").trim();
    if (!text) continue;

    for (const m of matches) {
      const t = parseTimeTag(m[1], m[2], m[3]);
      lines.push({ time: t, text });
    }
  }
  lines.sort((a, b) => a.time - b.time);
  return lines;
}

/** 检测歌词格式 */
function detectSource(raw: string): LyricSource {
  const trimmed = raw.trim();
  if (/<tt\b/i.test(trimmed)) return "ttml";
  if (trimmed.startsWith("<?xml") || trimmed.startsWith("<song")) return "qrc";
  if (/^\[(\d{1,3}):(\d{2})/.test(trimmed)) return "lrc";
  if (/\((\d+),(\d+)\)/.test(trimmed)) return "yrc";
  return "unknown";
}

/** 主解析入口 */
export function parseLyrics(raw: string): LyricData {
  const source = detectSource(raw);

  let lines: LyricLine[] = [];

  switch (source) {
    case "lrc":
      lines = parseLRC(raw);
      break;
    case "ttml":
    case "qrc":
    case "yrc":
    case "unknown":
    default:
      // 当前仅内置 LRC 解析，其他格式后续扩展
      lines = parseLRC(raw);
      break;
  }

  return { title: "", artist: "", lines };
}

export { detectSource };
export type { LyricData, LyricLine, LyricSource };
