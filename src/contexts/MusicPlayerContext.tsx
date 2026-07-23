import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from "react";

interface AudioState {
  duration: number;
  playing: boolean;
  pos: number;
}

interface MusicPlayerContextValue {
  audioState: AudioState;
  playingFile: string;
  volume: number;
  playFile: (fp: string) => void;
  toggle: (currentSelectedFile?: string) => void;
  stop: () => void;
  seek: (clientX: number, progressRef: React.RefObject<HTMLDivElement | null>) => void;
  setVolume: (v: number) => void;
  fmtTime: (ms: number) => string;
}

const MusicPlayerContext = createContext<MusicPlayerContextValue>({
  audioState: { duration: 0, playing: false, pos: 0 },
  playingFile: "",
  volume: 40,
  playFile: () => {},
  toggle: () => {},
  stop: () => {},
  seek: () => {},
  setVolume: () => {},
  fmtTime: () => "0:00",
});

export function useMusicPlayer() {
  return useContext(MusicPlayerContext);
}

export function MusicPlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioState, setAudioState] = useState<AudioState>({
    duration: 0,
    playing: false,
    pos: 0,
  });
  const [playingFile, setPlayingFile] = useState("");
  const isStoppingRef = useRef(false);
  const [volume, setVolumeState] = useState(() => {
    try {
      const saved = localStorage.getItem("music_volume");
      return saved ? parseInt(saved) : 40;
    } catch {
      return 40;
    }
  });

  // Create persistent Audio element - never destroyed during page navigation
  useEffect(() => {
    const audio = new Audio();
    audio.preload = "auto";
    audio.volume = volume / 100;
    audioRef.current = audio;

    const onDur = () => {
      const d = audio.duration;
      if (isFinite(d) && d > 0) setAudioState(prev => ({ ...prev, duration: d }));
    };
    const onTime = () => setAudioState(prev => ({ ...prev, pos: audio.currentTime }));
    const onPlay = () => setAudioState(prev => ({ ...prev, playing: true }));
    const onPause = () => setAudioState(prev => ({ ...prev, playing: false }));
    const onEnd = () => setAudioState(prev => ({ ...prev, playing: false, pos: 0 }));
    const onErr = () => {
      if (isStoppingRef.current) {
        isStoppingRef.current = false;
        setAudioState({ duration: 0, playing: false, pos: 0 });
        return;
      }
      console.error("[Audio]", audio.error?.message);
      setAudioState({ duration: 0, playing: false, pos: 0 });
    };

    audio.addEventListener("loadedmetadata", onDur);
    audio.addEventListener("durationchange", onDur);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnd);
    audio.addEventListener("error", onErr);

    return () => {
      audio.removeEventListener("loadedmetadata", onDur);
      audio.removeEventListener("durationchange", onDur);
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnd);
      audio.removeEventListener("error", onErr);
      audio.pause();
      audio.src = "";
    };
  }, []); // Only on App mount/unmount

  // Sync volume to audio element
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume / 100;
  }, [volume]);

  const playFile = useCallback((fp: string) => {
    const audio = audioRef.current;
    if (!fp || !audio) return;
    setPlayingFile(fp);
    audio.src = window.electronAPI?.python.getFileUrl(fp) ?? "";
    audio.play().catch(e => console.error("[Audio] Play failed:", e));
    setAudioState(prev => ({ ...prev, pos: 0 }));
  }, []);

  const toggle = useCallback((currentSelectedFile?: string) => {
    const audio = audioRef.current;
    if (!audio) return;
    const noSrc = !audio.src || audio.src === window.location.href;
    if (noSrc) {
      if (currentSelectedFile) playFile(currentSelectedFile);
      return;
    }
    if (playingFile && currentSelectedFile && currentSelectedFile !== playingFile) {
      playFile(currentSelectedFile);
      return;
    }
    if (audio.paused) audio.play().catch(() => {});
    else audio.pause();
  }, [playingFile, playFile]);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    isStoppingRef.current = true;
    audio.pause();
    audio.currentTime = 0;
    audio.src = "";
    setAudioState({ duration: 0, playing: false, pos: 0 });
    setPlayingFile("");
  }, []);

  const seek = useCallback((clientX: number, progressRef: React.RefObject<HTMLDivElement | null>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const bar = progressRef.current;
    if (!bar) return;
    const rect = bar.getBoundingClientRect();
    const frac = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const dur = audioState.duration || audio.duration || 1;
    const sec = frac * dur;
    audio.currentTime = sec;
    setAudioState(prev => ({ ...prev, pos: sec }));
  }, [audioState.duration]);

  const setVolume = useCallback((v: number) => {
    setVolumeState(v);
    localStorage.setItem("music_volume", String(v));
  }, []);

  const fmtTime = useCallback((ms: number) => {
    if (!ms || ms <= 0 || !isFinite(ms)) return "0:00";
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  }, []);

  return (
    <MusicPlayerContext.Provider
      value={{ audioState, playingFile, volume, playFile, toggle, stop, seek, setVolume, fmtTime }}
    >
      {children}
    </MusicPlayerContext.Provider>
  );
}