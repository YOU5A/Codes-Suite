/**
 * LyricManager — 歌词状态管理 Hook
 *
 * 负责: 当前歌曲信息 / 获取歌词 / 缓存 / 时间同步
 *
 * @module lyrics/LyricManager
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { useMusicPlayer } from "@/contexts/MusicPlayerContext";
import { parseLyrics } from "./LyricParser";
import type { LyricData, LyricLine } from "./types";

/** 歌词缓存: key = 文件路径 */
const lyricCache = new Map<string, LyricData>();

export interface LyricManagerState {
  /** 当前歌词数据，null 表示未加载 */
  lyricData: LyricData | null;
  /** 是否正在加载 */
  loading: boolean;
  /** 错误信息 */
  error: string | null;
  /** 当前高亮行索引 */
  currentLineIndex: number;
  /** 当前播放秒数 */
  currentTime: number;
}

export function useLyricManager() {
  const { audioState, playingFile } = useMusicPlayer();
  const [lyricData, setLyricData] = useState<LyricData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentLineIndex, setCurrentLineIndex] = useState(-1);
  const [currentTime, setCurrentTime] = useState(0);

  const lastFileRef = useRef<string>("");

  /** 根据当前时间计算歌词行 */
  const computeLineIndex = useCallback((time: number, lines: LyricLine[]): number => {
    let idx = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].time <= time) idx = i;
      else break;
    }
    return idx;
  }, []);

  /** 获取歌词 */
  const fetchLyrics = useCallback(async (filePath: string) => {
    if (!filePath) return;

    // 检查缓存
    if (lyricCache.has(filePath)) {
      setLyricData(lyricCache.get(filePath)!);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 通过 Python Bridge 获取歌词文件（与音频同目录的 .lrc 文件）
      const result = await window.electronAPI?.python.call("music.get_lyrics", {
        filepath: filePath,
      });

      if (result?.lyrics_text) {
        const data = parseLyrics(result.lyrics_text);
        lyricCache.set(filePath, data);
        setLyricData(data);
      } else {
        setLyricData(null);
        setError("暂无歌词");
      }
    } catch (e: any) {
      setError(e?.message || "获取歌词失败");
      setLyricData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  /** 歌曲切换时重新获取 */
  useEffect(() => {
    if (playingFile && playingFile !== lastFileRef.current) {
      lastFileRef.current = playingFile;
      setCurrentLineIndex(-1);
      setCurrentTime(0);
      fetchLyrics(playingFile);
    }
    if (!playingFile) {
      lastFileRef.current = "";
      setLyricData(null);
      setError(null);
      setCurrentLineIndex(-1);
    }
  }, [playingFile, fetchLyrics]);

  /** timeupdate 同步 */
  useEffect(() => {
    const t = audioState.pos ?? 0;
    setCurrentTime(t);
    if (lyricData?.lines?.length) {
      setCurrentLineIndex(computeLineIndex(t, lyricData.lines));
    }
  }, [audioState.pos, lyricData, computeLineIndex]);

  /** 清除缓存（用于手动刷新） */
  const clearCache = useCallback(() => {
    lyricCache.clear();
  }, []);

  return {
    lyricData,
    loading,
    error,
    currentLineIndex,
    currentTime,
    fetchLyrics,
    clearCache,
  } as LyricManagerState & { fetchLyrics: (fp: string) => Promise<void>; clearCache: () => void };
}
