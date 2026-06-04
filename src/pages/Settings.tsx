import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sun, Moon, Monitor, Globe, Palette, Sliders,
  Layout, Type, Zap, Eye, RotateCcw
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/hooks/useTheme";
import { useConfirm } from "@/contexts/ConfirmContext";
import { useToast } from "@/contexts/ToastContext";
import GlassCard from "@/components/GlassCard";
import { getAnimDuration, EASE_OUT } from "@/utils/animations";
import type { Theme, Language } from "@/types";

const t: Record<Language, Record<string, string>> = {
  zh: {
    title: "个性化设置",
    appearance: "外观",
    themeLabel: "主题",
    light: "浅色",
    dark: "深色",
    auto: "自动",
    graphite: "石墨",
    midnight: "午夜",
    ocean: "海洋",
    emerald: "翡翠",
    crimson: "深红",
    opacity: "窗口透明度",
    radius: "圆角大小",
    animSpeed: "动画速度",
    animNormal: "缓慢",
    animFast: "标准",
    animOff: "关闭",
    windowBehavior: "窗口行为",
    autoStart: "开机启动",
    minToTray: "最小化到托盘",
    closeToTray: "关闭到托盘",
    autoAdmin: "自动管理员模式",
    rememberSize: "记住窗口大小",
    rememberPos: "记住窗口位置",
    musicSettings: "音乐设置",
    defaultVol: "默认音量",
    autoResume: "自动恢复播放",
    autoScan: "自动扫描目录",
    interface: "界面设置",
    sidebarWidth: "侧边栏宽度",
    fontScale: "界面缩放",
    compact: "紧凑模式",
    standard: "中等模式",
    large: "标准",
    resetSettings: "重置所有设置",
    resetConfirm: "确定要恢复默认设置吗？",
    about: "关于",
    aboutTitle: "Codes Suite",
    aboutVersion: "版本 1.1.0",
    aboutDesc: "统一 Windows 系统管理工具",
    aboutAuthor: "作者: Y0USA",
    aboutTech: "Electron + React + Python",
    github: "GitHub",
    bilibili: "B站",
    usertool: "UserTool",
    language: "语言",
  },
  en: {
    title: "Personalization",
    appearance: "Appearance",
    themeLabel: "Theme",
    light: "Light",
    dark: "Dark",
    auto: "Auto",
    graphite: "Graphite",
    midnight: "Midnight",
    ocean: "Ocean",
    emerald: "Emerald",
    crimson: "Crimson",
    opacity: "Window Opacity",
    radius: "Corner Radius",
    animSpeed: "Animation Speed",
    animNormal: "Slow",
    animFast: "Standard",
    animOff: "Off",
    windowBehavior: "Window Behavior",
    autoStart: "Auto Start",
    minToTray: "Minimize to Tray",
    closeToTray: "Close to Tray",
    autoAdmin: "Auto Admin Mode",
    rememberSize: "Remember Window Size",
    rememberPos: "Remember Window Position",
    musicSettings: "Music Settings",
    defaultVol: "Default Volume",
    autoResume: "Auto Resume Playback",
    autoScan: "Auto Scan Directory",
    interface: "Interface",
    sidebarWidth: "Sidebar Width",
    fontScale: "UI Scale",
    compact: "Compact",
    standard: "Medium",
    large: "Standard",
    resetSettings: "Reset All Settings",
    resetConfirm: "Restore default settings?",
    about: "About",
    aboutTitle: "Codes Suite",
    aboutVersion: "Version 1.1.0",
    aboutDesc: "Unified Windows System Management Tool",
    aboutAuthor: "Author: Y0USA",
    aboutTech: "Electron + React + Python",
    github: "GitHub",
    bilibili: "Bilibili",
    usertool: "UserTool",
    language: "Language",
  },
};

const themes: { value: Theme; icon: React.ReactNode; key: string }[] = [
  { value: "auto", icon: <Monitor size={16} />, key: "auto" },
];

const themeDropdownOptions: { value: Theme; icon: React.ReactNode; key: string }[] = [
  { value: "light", icon: <Sun size={16} />, key: "light" },
  { value: "dark", icon: <Moon size={16} />, key: "dark" },
  { value: "graphite", icon: <Palette size={16} />, key: "graphite" },
  { value: "midnight", icon: <Moon size={16} />, key: "midnight" },
  { value: "ocean", icon: <Palette size={16} />, key: "ocean" },
  { value: "emerald", icon: <Palette size={16} />, key: "emerald" },
  { value: "crimson", icon: <Palette size={16} />, key: "crimson" },
];

function Toggle({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <div
      className={"toggle-switch" + (active ? " active" : "")}
      onClick={onClick}
      style={{
        width: 44, height: 26, borderRadius: 13,
        position: "relative", cursor: "pointer", flexShrink: 0,
        transition: "background var(--transition-fast) ease",
      }}
    >
      <div style={{
        position: "absolute",
        top: 3, left: active ? 21 : 3,
        width: 20, height: 20, borderRadius: "50%",
        boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
        transition: "left var(--transition-fast) ease",
      }} />
    </div>
  );
}

function ThemeDropdown({
  value,
  onChange,
  options,
  tx,
}: {
  value: Theme;
  onChange: (v: Theme) => void;
  options: { value: Theme; icon: React.ReactNode; key: string }[];
  tx: Record<string, string>;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});


  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (triggerRef.current && triggerRef.current.contains(target)) return;
      if (target.closest("[data-theme-dropdown]")) return;
      setOpen(false);
    };
    if (open) {
      document.addEventListener("mousedown", handler);
      const rect = triggerRef.current?.getBoundingClientRect();
      if (rect) {
        setDropdownStyle({
          position: "fixed",
          top: rect.bottom + 6,
          left: rect.left,
          width: rect.width,
          zIndex: 9999,
        });
      }
      return () => document.removeEventListener("mousedown", handler);
    }
  }, [open]);

  const selected = options.find((o) => o.value === value);
  const selectedLabel = selected ? (tx[selected.key] ?? selected.value) : (tx.light ?? "Light");
  const selectedIcon = selected?.icon ?? <Sun size={14} />;

  return (
    <div ref={triggerRef} style={{ position: "relative", flex: 1 }}>
      <div
        onClick={() => setOpen(!open)}
        className="input-field"
        style={{
          paddingRight: 32, cursor: "pointer",
          display: "flex", alignItems: "center", gap: 8,
          userSelect: "none", height: 40,
          borderColor: value !== "auto" ? "var(--accent)" : undefined,
          boxShadow: value !== "auto" ? "0 0 0 2px var(--accent-bg)" : undefined,
        }}
      >
        <span style={{ color: "var(--text-secondary)" }}>{selectedIcon}</span>
        <span style={{ flex: 1, fontSize: 13 }}>{selectedLabel}</span>
        <motion.svg
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2, ease: EASE_OUT }}
          style={{ position: "absolute", right: 12, top: "50%", marginTop: -3 }}
          width="10" height="6" viewBox="0 0 10 6" fill="none"
        >
          <path d="M1 1L5 5L9 1" stroke="var(--text-tertiary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </motion.svg>
      </div>
      {open && createPortal(
        <AnimatePresence>
          <motion.div
            data-theme-dropdown
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.18, ease: EASE_OUT }}
            style={{
              ...dropdownStyle,
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid var(--border-color)",
              borderRadius: 12,
              boxShadow: "0 12px 40px rgba(0,0,0,0.25), 0 0 0 0.5px rgba(255,255,255,0.06) inset",
              padding: "6px 0",
              overflow: "hidden",
            }}
          >
            {options.map((o) => (
              <div
                key={o.value}
                onClick={() => { onChange(o.value); setOpen(false); }}
                style={{
                  padding: "9px 14px",
                  fontSize: 13,
                  color: o.value === value ? "var(--accent)" : "var(--text-primary)",
                  cursor: "pointer",
                  transition: "background 0.15s ease",
                  fontWeight: o.value === value ? 500 : 400,
                  display: "flex", alignItems: "center", gap: 8,
                }}
                onMouseEnter={(e) => {
                  if (o.value !== value) (e.currentTarget as HTMLElement).style.background = "var(--bg-tertiary)";
                }}
                onMouseLeave={(e) => {
                  if (o.value !== value) (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
              >
                <span style={{ color: o.value === value ? "var(--accent)" : "var(--text-tertiary)" }}>{o.icon}</span>
                {tx[o.key] ?? o.value}
              </div>
            ))}
          </motion.div>
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}

function SliderRow({ icon, label, value, min, max, step, onChange, unit }: {
  icon: React.ReactNode; label: string; value: number; min: number; max: number;
  step?: number; onChange: (v: number) => void; unit?: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: "var(--text-secondary)" }}>{icon}</span>
          <span style={{ fontSize: 13, color: "var(--text-primary)" }}>{label}</span>
        </div>
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--accent)", minWidth: 48, textAlign: "right" }}>
          {value}{unit ?? ""}
        </span>
      </div>
      <input type="range" min={min} max={max} step={step ?? 1} value={value}
        onChange={(e) => onChange(Number(e.target.value))} style={{ width: "100%" }} />
    </div>
  );
}

export default function Settings() {
  const { lang, setLang } = useLanguage();
  const { theme, settings, setTheme, updateSettings, resetSettings } = useTheme();
  const { confirm } = useConfirm();
  const { showToast } = useToast();
  const tx = t[lang];




  const handleReset = async () => {
    if (await confirm({ title: tx.resetConfirm, danger: true })) {
      resetSettings();
      showToast(lang === "zh" ? "已重置为默认设置" : "Settings reset to defaults", "success");
    }
  };



  const animDuration = getAnimDuration(settings.animationSpeed);

  return (
    <motion.div
      animate={{ opacity: 1 }}
      transition={{ duration: animDuration, ease: EASE_OUT }}
      style={{ maxWidth: 680, margin: "0 auto" }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
          {tx.title}
        </h1>
      </div>

      {/* ── Appearance ── */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{
          fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase",
          letterSpacing: "0.06em", marginBottom: 12, paddingLeft: 4,
        }}>
          <Eye size={12} style={{ display: "inline", marginRight: 6, verticalAlign: "middle" }} />
          {tx.appearance}
        </h2>

        {/* Theme selector: Auto button + dropdown */}
        <GlassCard style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <Palette size={14} style={{ color: "var(--text-secondary)" }} />
            <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>{tx.themeLabel}</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {themes.map((t) => (
              <button
                key={t.value}
                onClick={() => setTheme(t.value)}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "10px 18px", borderRadius: 10, cursor: "pointer", height: 40,
                  border: theme === t.value ? "2px solid var(--accent)" : "1px solid var(--border-color)",
                  color: theme === t.value ? "var(--accent)" : "var(--text-secondary)",
                  transition: "all var(--transition-fast) ease", flexShrink: 0,
                }}
              >
                {t.icon}
                <span style={{ fontSize: 13, fontWeight: 500 }}>{(tx as any)[t.key] ?? t.key}</span>
              </button>
            ))}
            <ThemeDropdown value={theme} onChange={setTheme} options={themeDropdownOptions} tx={tx as any} />
          </div>
        </GlassCard>

        {/* Opacity, Blur, Radius */}
        <GlassCard style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <SliderRow icon={<Eye size={14} />} label={tx.opacity}
              value={settings.windowOpacity} min={50} max={100} unit="%"
              onChange={(v) => { updateSettings({ windowOpacity: v }); window.electronAPI?.window.setOpacity(v / 100); }}
            />
            <SliderRow icon={<Layout size={14} />} label={tx.radius}
              value={settings.borderRadius} min={8} max={30} unit="px"
              onChange={(v) => updateSettings({ borderRadius: v })}
            />
          </div>
        </GlassCard>

        {/* Animation speed */}
        <GlassCard>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <Zap size={14} style={{ color: "var(--text-secondary)" }} />
            <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>{tx.animSpeed}</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {(["fast", "normal", "off"] as const).map((s) => (
              <motion.button key={s}
                className={settings.animationSpeed === s ? "btn-primary" : "btn-secondary"}
                onClick={() => updateSettings({ animationSpeed: s })}
                whileTap={{ scale: 0.94 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
                style={{ flex: 1, justifyContent: "center", fontSize: 12, padding: "10px 16px" }}
              >
                {(tx as any)["anim" + s.charAt(0).toUpperCase() + s.slice(1)] ?? s}
              </motion.button>
            ))}
          </div>
        </GlassCard>
      </div>


      {/* ── Window Behavior ── */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{
          fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase",
          letterSpacing: "0.06em", marginBottom: 12, paddingLeft: 4,
        }}>
          <Sliders size={12} style={{ display: "inline", marginRight: 6, verticalAlign: "middle" }} />
          {tx.windowBehavior}
        </h2>
        <GlassCard>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <ToggleRow icon={<Layout size={14} />} label={tx.rememberSize}
              active={settings.rememberSize} onChange={(v) => updateSettings({ rememberSize: v })}
            />
            <ToggleRow icon={<Layout size={14} />} label={tx.rememberPos}
              active={settings.rememberPosition} onChange={(v) => updateSettings({ rememberPosition: v })}
            />
          </div>
        </GlassCard>
      </div>

      {/* ── Interface ── */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{
          fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase",
          letterSpacing: "0.06em", marginBottom: 12, paddingLeft: 4,
        }}>
          <Type size={12} style={{ display: "inline", marginRight: 6, verticalAlign: "middle" }} />
          {tx.interface}
        </h2>
        <GlassCard>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <SliderRow icon={<Layout size={14} />} label={tx.sidebarWidth}
              value={settings.sidebarWidth} min={180} max={320} unit="px"
              onChange={(v) => updateSettings({ sidebarWidth: v })}
            />
            <SliderRow icon={<Type size={14} />} label={tx.fontScale}
              value={settings.fontScale} min={80} max={150} unit="%"
              onChange={(v) => updateSettings({ fontScale: v })}
            />
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <motion.button
                className={settings.compactMode === false && settings.fontScale === 120 ? "btn-primary" : "btn-secondary"}
                onClick={() => updateSettings({ compactMode: false, fontScale: 120 })}
                whileTap={{ scale: 0.94 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
                style={{ flex: 1, justifyContent: "center", fontSize: 12, padding: "8px 12px" }}>
                {tx.large}
              </motion.button>
              <motion.button
                className={settings.compactMode === false && settings.fontScale === 100 ? "btn-primary" : "btn-secondary"}
                onClick={() => updateSettings({ compactMode: false, fontScale: 100 })}
                whileTap={{ scale: 0.94 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
                style={{ flex: 1, justifyContent: "center", fontSize: 12, padding: "8px 12px" }}>
                {tx.standard}
              </motion.button>
              <motion.button
                className={settings.compactMode ? "btn-primary" : "btn-secondary"}
                onClick={() => updateSettings({ compactMode: true, fontScale: 90 })}
                whileTap={{ scale: 0.94 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
                style={{ flex: 1, justifyContent: "center", fontSize: 12, padding: "8px 12px" }}>
                {tx.compact}
              </motion.button>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* ── Language ── */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{
          fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase",
          letterSpacing: "0.06em", marginBottom: 12, paddingLeft: 4,
        }}>
          <Globe size={12} style={{ display: "inline", marginRight: 6, verticalAlign: "middle" }} />
          {tx.language}
        </h2>
        <GlassCard>
          <div style={{ display: "flex", gap: 10 }}>
            <motion.button className={lang === "zh" ? "btn-primary" : "btn-secondary"}
              onClick={() => setLang("zh")} whileTap={{ scale: 0.94 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
              style={{ flex: 1, justifyContent: "center", padding: "10px 16px" }}>
              <Globe size={14} style={{ marginRight: 6 }} />中文
            </motion.button>
            <motion.button className={lang === "en" ? "btn-primary" : "btn-secondary"}
              onClick={() => setLang("en")} whileTap={{ scale: 0.94 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
              style={{ flex: 1, justifyContent: "center", padding: "10px 16px" }}>
              <Globe size={14} style={{ marginRight: 6 }} />English
            </motion.button>
          </div>
        </GlassCard>
      </div>

      {/* ── Reset ── */}
      <div style={{ marginBottom: 24 }}>
        <motion.button className="btn-danger" onClick={handleReset}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          style={{ width: "100%", justifyContent: "center", padding: "12px 20px", display: "inline-flex", alignItems: "center", gap: 6 }}>
          <RotateCcw size={14} /> {tx.resetSettings}
        </motion.button>
      </div>

      {/* ── About ── */}
      <GlassCard style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <img src="./icon.png" alt="" style={{ width: 48, height: 48, borderRadius: 10 }} />
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>{tx.aboutTitle}</div>
            <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>{tx.aboutVersion}</div>
          </div>
        </div>
        <div style={{ fontSize: 12, color: "var(--text-tertiary)", lineHeight: 1.8 }}>
          <div>{tx.aboutDesc}</div>
          <div>{tx.aboutAuthor}</div>
          <div>{tx.aboutTech}</div>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <button className="btn-secondary" style={{ fontSize: 11, padding: "6px 14px" }}
            onClick={() => window.electronAPI?.shell.openExternal("https://github.com/YOU5A")}>
            {tx.github}
          </button>
          <button className="btn-secondary" style={{ fontSize: 11, padding: "6px 14px" }}
            onClick={() => window.electronAPI?.shell.openExternal("https://space.bilibili.com/353017137")}>
            {tx.bilibili}
          </button>
          <button className="btn-secondary" style={{ fontSize: 11, padding: "6px 14px" }}
            onClick={() => window.electronAPI?.shell.openExternal("https://you5a.github.io/UserTool")}>
            {tx.usertool}
          </button>
        </div>
      </GlassCard>
    </motion.div>
  );
}

function ToggleRow({ icon, label, active, onChange }: {
  icon: React.ReactNode; label: string; active: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ color: "var(--text-secondary)" }}>{icon}</span>
        <span style={{ fontSize: 13, color: "var(--text-primary)" }}>{label}</span>
      </div>
      <Toggle active={active} onClick={() => onChange(!active)} />
    </div>
  );
}