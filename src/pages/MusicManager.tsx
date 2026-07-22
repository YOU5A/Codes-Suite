import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  FolderOpen, Search, Save, Image, X, Play, Pause, Square,
  Volume2, Trash2, Music, Edit3
} from "lucide-react";
import {
  GlassCard,
  GlassButton,
  GlassInput,
  GlassSurface,
  GlassEmptyState,
  GlassBadge,
  space,
  fontSizes,
  radii,
} from "@/design-system";
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

  // ── Toolbar actions ──
  const clearTagFields = () => {
    setTagTitle(""); setTagArtist(""); setTagAlbum(""); setTagYear("");
  };

  return (
    <motion.div
      animate={{ opacity: 1 }}
      transition={{ duration: animationDuration, ease: EASE_OUT }}
      style={{ height: "100%", display: "flex", flexDirection: "column", gap: space[3] }}
    >
      {/* Title + Toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: space[3], flexShrink: 0 }}>
        <h1 style={{ fontSize: fontSizes["2xl"], fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>
          {tx.title}
        </h1>
        {files.length > 0 && (
          <GlassBadge variant="accent" size="sm">{files.length} {lang === "zh" ? "\u6587\u4ef6" : "files"}</GlassBadge>
        )}
        <div style={{ flex: 1 }} />
        <GlassButton variant="primary" onClick={browse} size="md">
          <FolderOpen size={14} /> {tx.browse}
        </GlassButton>
        <GlassButton variant="secondary" onClick={() => doScan()} size="md">
          <Search size={14} /> {tx.scan}
        </GlassButton>
      </div>

      {/* Empty State */}
      {files.length === 0 ? (
        <GlassEmptyState
          icon={<Music size={48} />}
          title={tx.noFiles}
          description={tx.formats}
          style={{ flex: 1 }}
        />
      ) : (
        <>
          {/* Main Content */}
          <div style={{ flex: 1, minHeight: 0, display: "flex", gap: space[4] }}>
            {/* Left: Cover */}
            <div style={{ width: 220, flexShrink: 0, display: "flex", flexDirection: "column", gap: space[3] }}>
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

              <div style={{ display: "flex", flexDirection: "column", gap: space[1] }}>
                <GlassButton variant="secondary" size="sm" inline={false} onClick={pickCover}
                  style={{ justifyContent: "center" }}>
                  <Image size={12} /> {tx.selectCover}
                </GlassButton>
                <GlassButton variant="secondary" size="sm" inline={false} onClick={applyCover}
                  style={{ justifyContent: "center" }}>
                  {tx.applyCover}
                </GlassButton>
                <GlassButton variant="secondary" size="sm" inline={false} onClick={removeCover}
                  style={{ justifyContent: "center" }}>
                  <Trash2 size={12} /> {tx.removeCover}
                </GlassButton>
              </div>

              {coverPreviewB64 && (
                <GlassCard style={{ padding: 0, overflow: "hidden" }}>
                  <img src={`data:image/jpeg;base64,${coverPreviewB64}`} alt="Cover Preview"
                    style={{ width: "100%", aspectRatio: "1", objectFit: "cover", borderRadius: radii.lg }} />
                </GlassCard>
              )}
            </div>

            {/* Right: Tag Editor + File List */}
            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: space[3] }}>
              {/* Tag Editor */}
              <GlassCard style={{ flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: space[2], marginBottom: space[3] }}>
                  <Edit3 size={14} style={{ color: "var(--text-secondary)" }} />
                  <span style={{ fontSize: fontSizes.md, fontWeight: 500, color: "var(--text-secondary)" }}>
                    {tx.tagEditor}
                  </span>
                  {selectedFile && (
                    <span style={{
                      fontSize: fontSizes.xs, color: "var(--text-tertiary)",
                      marginLeft: "auto", maxWidth: "45%",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {selectedFile.split("\\").pop()}
                    </span>
                  )}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: space[2] }}>
                  <GlassInput value={tagTitle} onChange={e => setTagTitle(e.target.value)} placeholder={tx.title_}
                    style={{ fontSize: fontSizes.sm, padding: space[1] + "px " + space[2] + "px" }} />
                  <GlassInput value={tagArtist} onChange={e => setTagArtist(e.target.value)} placeholder={tx.artist}
                    style={{ fontSize: fontSizes.sm, padding: space[1] + "px " + space[2] + "px" }} />
                  <GlassInput value={tagAlbum} onChange={e => setTagAlbum(e.target.value)} placeholder={tx.album}
                    style={{ fontSize: fontSizes.sm, padding: space[1] + "px " + space[2] + "px" }} />
                  <GlassInput value={tagYear} onChange={e => setTagYear(e.target.value)} placeholder={tx.year}
                    style={{ fontSize: fontSizes.sm, padding: space[1] + "px " + space[2] + "px" }} />
                </div>

                <div style={{ display: "flex", gap: space[2], marginTop: space[3] }}>
                  <GlassButton variant="primary" onClick={saveTags} disabled={saving} size="md">
                    <Save size={12} /> {tx.saveTags}
                  </GlassButton>
                  <GlassButton variant="secondary" onClick={clearTagFields} size="md">
                    <X size={12} /> {tx.clearTags}
                  </GlassButton>
                  <GlassButton variant="secondary" onClick={applyAll} disabled={saving} size="md">
                    {tx.applyAll}
                  </GlassButton>
                </div>

                {/* Rename Row */}
                <div style={{ display: "flex", gap: space[2], marginTop: space[3] }}>
                  <GlassInput
                    value={renameName}
                    onChange={e => setRenameName(e.target.value)}
                    style={{ flex: 1, fontSize: fontSizes.sm, padding: space[1] + "px " + space[2] + "px" }}
                  />
                  <GlassButton variant="secondary" onClick={renameOne} size="sm">
                    {tx.renameSelected}
                  </GlassButton>
                  <GlassButton variant="secondary" onClick={renameAll} size="sm">
                    {tx.renameAll}
                  </GlassButton>
                </div>
              </GlassCard>

              {/* File List */}
              <GlassCard style={{ flex: 1, minHeight: 0, padding: 0, overflow: "hidden" }}>
                <div style={{
                  height: "100%", overflowY: "auto",
                  padding: space[2] + "px 0",
                }}>
                  {files.map((fp: string) => {
                    const name = fp.split("\\").pop() || fp;
                    const active = fp === selectedFile;
                    return (
                      <div
                        key={fp}
                        onClick={() => { selectFile(fp); }}
                        style={{
                          padding: space[2] + "px " + space[4] + "px",
                          cursor: "pointer",
                          fontSize: fontSizes.sm,
                          color: active ? "var(--accent)" : "var(--text-secondary)",
                          background: active ? "var(--accent-bg)" : "transparent",
                          borderLeft: active ? "3px solid var(--accent)" : "3px solid transparent",
                          display: "flex", alignItems: "center", gap: space[2],
                          transition: "background var(--transition-fast)",
                        }}
                      >
                        <Music size={12} />
                        <span style={{
                          flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>
                          {name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </GlassCard>
            </div>
          </div>
        </>
      )}

      {/* Player Bar */}
      <GlassSurface
        tier="regular"
        style={{
          flexShrink: 0,
          padding: space[4] + "px " + space[6] + "px",
          display: "flex",
          flexDirection: "column",
          gap: space[3],
        }}
      >
        {/* Info Row */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span style={{
            fontSize: fontSizes.sm, fontWeight: 500, color: "var(--text-primary)",
            maxWidth: "65%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {playback.is_playing || playback.is_paused
              ? (selectedFile ? selectedFile.split("\\").pop() : tx.nowPlaying)
              : tx.noMusic}
          </span>
          <span style={{
            fontSize: fontSizes.xs, color: "var(--text-tertiary)",
            fontVariantNumeric: "tabular-nums",
          }}>
            {fmtTime(playback.position_ms)} / {fmtTime(playback.length_ms)}
          </span>
        </div>

        {/* Progress Bar */}
        <div
          ref={progressRef}
          onMouseDown={handleProgressMouseDown}
          style={{
            width: "100%", height: 6, borderRadius: 3,
            background: "rgba(128,128,128,0.25)",
            cursor: "pointer", position: "relative",
          }}
        >
          <div style={{
            position: "absolute", top: 0, left: 0, height: "100%", borderRadius: 3,
            width: `${pct}%`,
            background: "var(--accent)",
            transition: "width 0.2s linear",
            boxShadow: "0 0 8px rgba(var(--accent-rgb, 99,102,241), 0.4)",
          }} />
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
          <GlassButton variant="ghost" size="sm" onClick={stop} noAnimation
            style={{ padding: 4 }}>
            <Square size={16} fill="currentColor" />
          </GlassButton>

          <motion.button
            whileTap={{ scale: 0.93 }}
            whileHover={{ scale: 1.06 }}
            transition={{ type: "tween", duration: 0.15, ease: EASE_OUT }}
            onClick={toggle}
            style={{
              background: "var(--accent)", border: "none", borderRadius: "50%",
              width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "#fff",
              boxShadow: "0 4px 16px rgba(var(--accent-rgb, 99,102,241), 0.35)",
            }}
          >
            {playback.is_playing
              ? <Pause size={18} fill="#fff" />
              : <Play size={18} fill="#fff" style={{ marginLeft: 2 }} />
            }
          </motion.button>

          {/* Volume */}
          <div style={{ display: "flex", alignItems: "center", gap: space[2], marginLeft: 8 }}>
            <Volume2 size={14} style={{ color: "var(--text-tertiary)" }} />
            <input
              type="range"
              min={0} max={100} value={volume}
              onChange={changeVol}
              style={{
                width: 80, height: 8,
                userSelect: "auto", accentColor: "var(--accent)", cursor: "pointer",
              }}
            />
            <span style={{
              fontSize: 10, color: "var(--text-tertiary)",
              minWidth: 28, textAlign: "right",
              fontVariantNumeric: "tabular-nums",
            }}>
              {volume}%
            </span>
          </div>
        </div>
      </GlassSurface>
    </motion.div>
  );
}
