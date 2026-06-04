import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  FolderOpen, Search, Save, Image, X, Play, Pause, Square,
  Volume2, Trash2, Music, Edit3
} from "lucide-react";
import GlassCard from "@/components/GlassCard";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/contexts/ToastContext";
import type { MusicMetadata, PlaybackState } from "@/types";
import { useTheme } from "@/hooks/useTheme";
import { getAnimDuration, EASE_OUT } from "@/utils/animations";

const t = {
  zh: {
    title: "音乐管理器",
    browse: "浏览",
    scan: "扫描",
    formats: "支持: MP3, FLAC, OGG, M4A, WAV, OPUS",
    tagEditor: "标签编辑",
    title_: "标题",
    artist: "艺术家",
    album: "专辑",
    year: "年份",
    genre: "流派",
    saveTags: "保存标签",
    clearTags: "清除",
    applyAll: "应用到所有",
    coverOps: "封面操作",
    selectCover: "选择封面",
    applyCover: "应用到选中",
    removeCover: "删除封面",
    renameSelected: "重命名选中",
    renameAll: "全部重命名",
    noFiles: "选择文件夹并扫描",
    noFileSelected: "请先选择文件",
    scanResult: "找到 {n} 个音频文件",
    tagsSaved: "标签已保存",
    coverApplied: "封面已应用",
    coverRemoved: "封面已删除",
    renameSuccess: "重命名成功",
    renameFailed: "重命名失败",
    nowPlaying: "正在播放",
    noMusic: "未选择曲目",
  },
  en: {
    title: "Music Manager",
    browse: "Browse",
    scan: "Scan",
    formats: "Supports: MP3, FLAC, OGG, M4A, WAV, OPUS",
    tagEditor: "Tag Editor",
    title_: "Title",
    artist: "Artist",
    album: "Album",
    year: "Year",
    genre: "Genre",
    saveTags: "Save Tags",
    clearTags: "Clear",
    applyAll: "Apply to All",
    coverOps: "Cover",
    selectCover: "Select",
    applyCover: "Apply",
    removeCover: "Remove",
    renameSelected: "Rename",
    renameAll: "Rename All",
    noFiles: "Select a folder and scan",
    noFileSelected: "Select a file first",
    scanResult: "Found {n} audio files",
    tagsSaved: "Tags saved",
    coverApplied: "Cover applied",
    coverRemoved: "Cover removed",
    renameSuccess: "Renamed successfully",
    renameFailed: "Rename failed",
    nowPlaying: "Now Playing",
    noMusic: "No track selected",
  },
};

export default function MusicManager() {
  const { lang } = useLanguage();
  const tx = t[lang];
  const { showToast } = useToast();

  const [folder, setFolder] = useState("");
  const [files, setFiles] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState("");
  const [metadata, setMetadata] = useState<MusicMetadata | null>(null);
  const [coverB64, setCoverB64] = useState<string | null>(null);
  const [newCoverPath, setNewCoverPath] = useState("");
  const [coverPreviewB64, setCoverPreviewB64] = useState<string | null>(null);

  const [tagTitle, setTagTitle] = useState("");
  const [tagArtist, setTagArtist] = useState("");
  const [tagAlbum, setTagAlbum] = useState("");
  const [tagYear, setTagYear] = useState("");
  const [renameName, setRenameName] = useState("");

  const [playback, setPlayback] = useState<PlaybackState>({
    position_ms: 0, length_ms: 0, is_playing: false, is_paused: false, is_open: false,
  });
  const [volume, setVolume] = useState(80);
  const [saving, setSaving] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);
  const hasScanned = useRef(false);
  const [isDragging, setIsDragging] = useState(false);

  // Mount: restore folder, check playback, load volume
  useEffect(() => {
    const init = async () => {
      const cfg = await window.electronAPI?.python.call('config.get').catch(() => null);
      if (cfg?.musicVolume !== undefined) {
        setVolume(cfg.musicVolume);
        window.electronAPI?.python.call('music.set_volume', { volume: cfg.musicVolume }).catch(() => {});
      }
      try {
        const saved = localStorage.getItem('music_folder');
        if (saved && !hasScanned.current) { hasScanned.current = true; setFolder(saved); doScan(saved); }
      } catch {}
      try {
        const pos = await window.electronAPI?.python.call('music.get_position').catch(() => null);
        if (pos && !pos.error && (pos.is_playing || pos.is_paused)) {
          setPlayback({
            position_ms: pos.position_ms ?? 0,
            length_ms: pos.length_ms ?? 0,
            is_playing: pos.is_playing ?? false,
            is_paused: pos.is_paused ?? false,
            is_open: pos.is_open ?? false,
          });
          if (pos.is_playing) startPoll();
        }
        // Also restore current file selection
        try {
          const cf = await window.electronAPI?.python.call('music.get_current_file').catch(() => null);
          if (cf?.filepath && !cf.error) {
            selectFile(cf.filepath);
          }
        } catch {}
      } catch {}
    };
    init();
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  // ── File ──

  const { settings } = useTheme();
  const animationDuration = getAnimDuration(settings.animationSpeed);

  const browse = async () => {
    const p = await window.electronAPI?.dialog.openFolder();
    if (p) {
      setFolder(p);
      try { localStorage.setItem('music_folder', p); } catch {}
      doScan(p);
    }
  };
  const doScan = async (dir?: string) => {
    const d = dir || folder;
    if (!d) return;
    const r = await window.electronAPI?.python.call("music.scan", { folder: d });
    if (r && !r.error) {
      setFiles(r.files ?? []);
      showToast(tx.scanResult.replace("{n}", String(r.count ?? 0)), "info");
    }
  };
  const selectFile = async (fp: string) => {
    setSelectedFile(fp);
    const m = await window.electronAPI?.python.call("music.get_metadata", { filepath: fp });
    if (m && !m.error) {
      setMetadata(m);
      setTagTitle(m.title ?? ""); setTagArtist(m.artist ?? "");
      setTagAlbum(m.album ?? ""); setTagYear(m.year ?? "");
    }
    const c = await window.electronAPI?.python.call("music.extract_cover", { filepath: fp });
    setCoverB64(c?.cover ?? null);
    setNewCoverPath(""); setCoverPreviewB64(null);
    const fname = fp.split("\\").pop() || fp;
    setRenameName(fname.replace(/\.[^.]+$/, ""));
  };

  // ── Playback ──
  const refresh = async () => {
    const r = await window.electronAPI?.python.call("music.get_position");
    if (r && !r.error) {
      const playing = r.is_playing ?? false;
      const paused = r.is_paused ?? false;
      setPlayback({ position_ms: r.position_ms ?? 0, length_ms: r.length_ms ?? 0, is_playing: playing, is_paused: paused, is_open: r.is_open ?? false });
      if (!playing && !paused) stopPoll();
    }
  };
  const startPoll = () => { stopPoll(); pollRef.current = setInterval(refresh, 250); };
  const stopPoll = () => { if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; } };
  // Drag tracking for progress bar
  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e: MouseEvent) => doSeek(e.clientX);
    const onUp = () => setIsDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [isDragging, playback.length_ms]);
  const playFile = async (fp: string) => {

    if (!fp) return;
    const r = await window.electronAPI?.python.call("music.play", { filepath: fp });
    if (r && !r.error) {
      setPlayback({ position_ms: 0, length_ms: r.length_ms ?? 0, is_playing: true, is_paused: false, is_open: true });
      startPoll();
    }
  };
  const toggle = async () => {
    if (!playback.is_open) {
      if (selectedFile) playFile(selectedFile); else showToast(tx.noFileSelected, "warning");
      return;
    }
    const r = await window.electronAPI?.python.call("music.pause");
    if (r && !r.error) {
      const p = r.is_playing ?? false;
      setPlayback(prev => ({ ...prev, is_playing: p, is_paused: !p }));
      p ? startPoll() : stopPoll();
    }
  };
  const stop = async () => {
    await window.electronAPI?.python.call("music.stop");
    stopPoll();
    setPlayback({ position_ms: 0, length_ms: 0, is_playing: false, is_paused: false, is_open: false });
  };
  // Calculate seek target from mouse position
  const calcSeekMs = (clientX: number): number => {
    const bar = progressRef.current;
    if (!bar) return 0;
    const rect = bar.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return Math.floor(pct * (playback.length_ms || 100));
  };
  const doSeek = async (clientX: number) => {
    const ms = calcSeekMs(clientX);
    await window.electronAPI?.python.call("music.seek", { position_ms: ms });
    setPlayback(prev => ({ ...prev, position_ms: ms }));
  };
  const handleProgressMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    doSeek(e.clientX);
  };
  const changeVol = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseInt(e.target.value);
    setVolume(v);
    await window.electronAPI?.python.call("music.set_volume", { volume: v });
    await window.electronAPI?.python.call("config.set", { musicVolume: v });
  };

  const fmtTime = (ms: number) => {
    if (!ms || ms <= 0) return "0:00";
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  };
  const pct = playback.length_ms > 0 ? (playback.position_ms / playback.length_ms) * 100 : 0;

  // ── Tags ──
  const saveTags = async () => {
    if (!selectedFile) { showToast(tx.noFileSelected, "warning"); return; }
    setSaving(true);
    const r = await window.electronAPI?.python.call("music.save_tags", {
      filepath: selectedFile, title: tagTitle, artist: tagArtist, album: tagAlbum, year: tagYear,
    });
    setSaving(false);
    showToast(r?.success ? tx.tagsSaved : (r?.error ?? "Failed"), r?.success ? "success" : "error");
    if (r?.success) selectFile(selectedFile);
  };
  const applyAll = async () => {
    setSaving(true);
    for (const fp of files)
      await window.electronAPI?.python.call("music.save_tags", { filepath: fp, title: tagTitle, artist: tagArtist, album: tagAlbum, year: tagYear });
    setSaving(false);
    showToast(tx.tagsSaved, "success");
  };

  // ── Cover ──
  const pickCover = async () => {
    const p = await window.electronAPI?.dialog.openFile({ name: "Images", extensions: ["jpg","jpeg","png","bmp","webp"] });
    if (p) {
      setNewCoverPath(p);
      const r = await window.electronAPI?.python.call("music.read_cover_file", { filepath: p });
      setCoverPreviewB64(r?.cover ?? null);
    }
  };
  const applyCover = async () => {
    if (!selectedFile || !newCoverPath) return;
    const r = await window.electronAPI?.python.call("music.apply_cover", { filepath: selectedFile, cover_path: newCoverPath });
    showToast(r?.success ? tx.coverApplied : (r?.error ?? ""), r?.success ? "success" : "error");
    if (r?.success) selectFile(selectedFile);
  };
  const removeCover = async () => {
    if (!selectedFile) return;
    const r = await window.electronAPI?.python.call("music.remove_cover", { filepath: selectedFile });
    showToast(r?.success ? tx.coverRemoved : (r?.error ?? ""), r?.success ? "success" : "error");
    if (r?.success) selectFile(selectedFile);
  };

  // ── Rename ──
  const renameOne = async () => {
    if (!selectedFile) { showToast(tx.noFileSelected, "warning"); return; }
    if (!renameName.trim()) { showToast(lang === "zh" ? "?????????" : "Enter a file name", "warning"); return; }
    const r = await window.electronAPI?.python.call("music.rename", { filepath: selectedFile, new_name: renameName.trim() });
    if (r?.success) { showToast(tx.renameSuccess, "success"); setSelectedFile(r.new_path); doScan(); }
    else showToast(r?.error ?? tx.renameFailed, "error");
  };
  const renameAll = async () => {
    let c = 0;
    for (const fp of files) {
      try {
        const m = await window.electronAPI?.python.call("music.get_metadata", { filepath: fp });
        if (!m?.error && m.title) {
          const nn = (m.artist ?? "") ? `${m.title} - ${m.artist}` : m.title;
          if ((await window.electronAPI?.python.call("music.rename", { filepath: fp, new_name: nn }))?.success) c++;
        }
      } catch {}
    }
    showToast(lang === "zh" ? `已重命名 ${c} 个文件` : `Renamed ${c} files`, c > 0 ? "success" : "warning");
    doScan();
  };

  return (
    <motion.div animate={{ opacity: 1 }} transition={{ duration: animationDuration, ease: EASE_OUT }}
      style={{ height: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
      {/* ── Title + Toolbar ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>
          {tx.title}
        </h1>
        <div style={{ flex: 1 }} />
        <button className="btn-primary" onClick={browse} style={{ padding: "7px 16px", fontSize: 12 }}>
          <FolderOpen size={13} /> {tx.browse}
        </button>
        <button className="btn-secondary" onClick={() => doScan()} style={{ padding: "7px 16px", fontSize: 12 }}>
          <Search size={13} /> {tx.scan}
        </button>
      </div>

      {/* ── Empty State ── */}
      {files.length === 0 ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
          <Music size={48} style={{ color: "var(--text-tertiary)", opacity: 0.3 }} />
          <span style={{ color: "var(--text-tertiary)", fontSize: 14 }}>{tx.noFiles}</span>
          <span style={{ color: "var(--text-tertiary)", fontSize: 11, opacity: 0.6 }}>{tx.formats}</span>
        </div>
      ) : (
        <>
          {/* ── Main Content ── */}
          <div style={{ flex: 1, minHeight: 0, display: "flex", gap: 16 }}>
            {/* Left: Cover */}
            <div style={{ width: 220, flexShrink: 0, display: "flex", flexDirection: "column", gap: 12 }}>
              <GlassCard style={{ padding: 0, overflow: "hidden" }}>
                <div style={{
                  width: "100%", aspectRatio: "1",
                  background: "var(--bg-tertiary)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {coverB64 ? (
                    <img src={`data:image/jpeg;base64,${coverB64}`} alt="Cover"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <Music size={48} style={{ color: "var(--text-tertiary)", opacity: 0.25 }} />
                  )}
                </div>
              </GlassCard>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <button className="btn-secondary" onClick={pickCover} style={{ padding: "6px 12px", fontSize: 11, justifyContent: "center", width: "100%" }}>
                  <Image size={11} /> {tx.selectCover}
                </button>
                <button className="btn-secondary" onClick={applyCover} style={{ padding: "6px 12px", fontSize: 11, justifyContent: "center", width: "100%" }}>
                  {tx.applyCover}
                </button>
                <button className="btn-secondary" onClick={removeCover} style={{ padding: "6px 12px", fontSize: 11, justifyContent: "center", width: "100%" }}>
                  <Trash2 size={11} /> {tx.removeCover}
                </button>
              </div>
              {/* Cover Preview */}
              {coverPreviewB64 && (
                <GlassCard style={{ padding: 0, overflow: "hidden" }}>
                  <img src={`data:image/jpeg;base64,${coverPreviewB64}`} alt="Cover Preview"
                    style={{ width: "100%", aspectRatio: "1", objectFit: "cover", borderRadius: 12 }} />
                </GlassCard>
              )}
            </div>

            {/* Right: Tag Editor + File List */}
            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 12 }}>
              {/* Tag Editor */}
              <GlassCard style={{ flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <Edit3 size={14} style={{ color: "var(--text-secondary)" }} />
                  <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)" }}>{tx.tagEditor}</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                  <div>
                    <label style={{ fontSize: 10, color: "var(--text-tertiary)", display: "block", marginBottom: 2 }}>{tx.title_}</label>
                    <input className="input-field" value={tagTitle} onChange={e => setTagTitle(e.target.value)} style={{ fontSize: 12, padding: "5px 8px" }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 10, color: "var(--text-tertiary)", display: "block", marginBottom: 2 }}>{tx.artist}</label>
                    <input className="input-field" value={tagArtist} onChange={e => setTagArtist(e.target.value)} style={{ fontSize: 12, padding: "5px 8px" }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 10, color: "var(--text-tertiary)", display: "block", marginBottom: 2 }}>{tx.album}</label>
                    <input className="input-field" value={tagAlbum} onChange={e => setTagAlbum(e.target.value)} style={{ fontSize: 12, padding: "5px 8px" }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 10, color: "var(--text-tertiary)", display: "block", marginBottom: 2 }}>{tx.year}</label>
                    <input className="input-field" value={tagYear} onChange={e => setTagYear(e.target.value)} style={{ fontSize: 12, padding: "5px 8px" }} />
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 6, justifyContent: "flex-end", gridColumn: "span 2" }}>
                    <button className="btn-primary" onClick={saveTags} disabled={saving} style={{ padding: "7px 14px", fontSize: 12, whiteSpace: "nowrap" }}>
                      <Save size={13} /> {tx.saveTags}
                    </button>
                    <button className="btn-danger" onClick={() => { setTagTitle(""); setTagArtist(""); setTagAlbum(""); setTagYear(""); }}
                      style={{ padding: "7px 14px", fontSize: 12, whiteSpace: "nowrap" }}>
                      <X size={13} /> {tx.clearTags}
                    </button>
                    <button className="btn-secondary" onClick={applyAll} disabled={saving} style={{ padding: "7px 14px", fontSize: 12, whiteSpace: "nowrap" }}>
                      {tx.applyAll}
                    </button>
                  </div>
                </div>
                <div style={{ marginTop: 8, display: "flex", gap: 6, alignItems: "center" }}>
                  <input className="input-field"
                    value={renameName}
                    onChange={e => setRenameName(e.target.value)}
                    placeholder={lang === "zh" ? "????..." : "Rename..."}
                    style={{ flex: 1, fontSize: 12, padding: "5px 8px" }} />
                  <button className="btn-secondary" onClick={renameOne} style={{ padding: "4px 6px", fontSize: 10, whiteSpace: "nowrap" }}>
                    <Edit3 size={11} /> {tx.renameSelected}
                  </button>
                  <button className="btn-secondary" onClick={renameAll} style={{ padding: "5px 10px", fontSize: 11, whiteSpace: "nowrap" }}>
                    {tx.renameAll}
                  </button>
                </div>
              </GlassCard>

              {/* File List */}
              <GlassCard style={{ flex: 1, minHeight: 0, padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                <div style={{ flex: 1, overflowY: "auto" }}>
                  {files.map(fp => {
                    const name = fp.split("\\").pop() || fp;
                    const active = fp === selectedFile;
                    return (
                      <div key={fp}
                        onClick={() => selectFile(fp)}
                        onDoubleClick={() => playFile(fp)}
                        style={{
                          padding: "7px 14px", cursor: "pointer", fontSize: 12,
                          color: active ? "var(--accent)" : "var(--text-primary)",
                          background: active ? "var(--accent-bg)" : "transparent",
                          borderBottom: "1px solid var(--border-color)",
                          display: "flex", alignItems: "center", gap: 8,
                          transition: "background var(--transition-fast)",
                        }}>
                        <Music size={12} />
                        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</span>
                      </div>
                    );
                  })}
                </div>
              </GlassCard>
            </div>
          </div>
        </>
      )}
      {/* ── Player Bar ── */}
      <div style={{
        flexShrink: 0,
        padding: "16px 24px",
        borderRadius: 20,
        background: "rgba(255,255,255,0.10)",
        backdropFilter: "blur(40px) saturate(180%)",
        WebkitBackdropFilter: "blur(40px) saturate(180%)",
        border: "1px solid rgba(255,255,255,0.12)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.08)",
      }}>
        {/* Info Row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span style={{
            fontSize: 12, fontWeight: 500, color: "var(--text-primary)",
            maxWidth: "65%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {playback.is_playing || playback.is_paused
              ? (selectedFile ? selectedFile.split("\\").pop() : tx.nowPlaying)
              : tx.noMusic}
          </span>
          <span style={{ fontSize: 11, color: "var(--text-tertiary)", fontVariantNumeric: "tabular-nums" }}>
            {fmtTime(playback.position_ms)} / {fmtTime(playback.length_ms)}
          </span>
        </div>

        {/* Progress Bar — pure div + CSS transition, no Framer Motion */}
        <div
          ref={progressRef} onMouseDown={handleProgressMouseDown}
          style={{
            width: "100%", height: 6, borderRadius: 3, marginBottom: 14,
            background: "rgba(128,128,128,0.25)",
            cursor: "pointer", position: "relative",
          }}
        >
          {/* Filled */}
          <div style={{
            position: "absolute", top: 0, left: 0, height: "100%", borderRadius: 3,
            width: `${pct}%`,
            background: "var(--accent)",
            transition: "width 0.2s linear",
            boxShadow: "0 0 8px rgba(var(--accent-rgb, 99,102,241), 0.4)",
          }} />
          {/* Thumb dot */}
          <div style={{
            position: "absolute", top: "50%", left: `${pct}%`,
            width: 12, height: 12, borderRadius: "50%",
            background: "#fff",
            boxShadow: "0 1px 6px rgba(0,0,0,0.3)",
            transform: "translate(-50%, -50%)",
            transition: "left 0.2s linear",
            pointerEvents: "none",
          }} />
        </div>

        {/* Controls Row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20 }}>
          {/* Stop */}
          <button onClick={stop} style={{
            background: "none", border: "none", cursor: "pointer",
            color: "var(--text-secondary)", padding: 4,
            opacity: 0.6, transition: "opacity var(--transition-fast)",
          }}
            onMouseEnter={e => e.currentTarget.style.opacity = "1"}
            onMouseLeave={e => e.currentTarget.style.opacity = "0.6"}
          >
            <Square size={16} fill="currentColor" />
          </button>

          {/* Play/Pause */}
          <motion.button whileTap={{ scale: 0.93 }} whileHover={{ scale: 1.06 }} transition={{ type: "tween", duration: 0.15, ease: EASE_OUT }}
            onClick={toggle}
            style={{
              background: "var(--accent)", border: "none", borderRadius: "50%",
              width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "#fff",
              boxShadow: "0 4px 16px rgba(var(--accent-rgb, 99,102,241), 0.35)",
            }}>
            {playback.is_playing ? <Pause size={18} fill="#fff" /> : <Play size={18} fill="#fff" style={{ marginLeft: 2 }} />}
          </motion.button>

          {/* Volume */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 8 }}>
            <Volume2 size={14} style={{ color: "var(--text-tertiary)" }} />
            <input type="range" min={0} max={100} value={volume} onChange={changeVol}
              style={{ width: 80, height: 8, userSelect: "auto", accentColor: "var(--accent)", cursor: "pointer" }} />
            <span style={{ fontSize: 10, color: "var(--text-tertiary)", minWidth: 28, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
              {volume}%
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}