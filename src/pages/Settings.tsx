import { useState, useRef, useEffect } from "react";
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
import {
  GlassButton,
  GlassInput,
  GlassModal,
  GlassSelect,
  GlassToggle,
  springDefault,
} from "@/design-system";
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
    bilibli: "B站",
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
    bilibli: "Bilibili",
    usertool: "UserTool",
    language: "Language",
  },
};

const themeDropdownOptions: { value: Theme; icon: React.ReactNode; key: string }[] = [
  { value: "light", icon: <Sun size={16} />, key: "light" },
  { value: "dark", icon: <Moon size={16} />, key: "dark" },
  { value: "auto", icon: <Monitor size={16} />, key: "auto" },
  { value: "graphite", icon: <Palette size={16} />, key: "graphite" },
  { value: "midnight", icon: <Moon size={16} />, key: "midnight" },
  { value: "ocean", icon: <Palette size={16} />, key: "ocean" },
  { value: "emerald", icon: <Palette size={16} />, key: "emerald" },
  { value: "crimson", icon: <Palette size={16} />, key: "crimson" },
];

function ToggleRow({ icon, label, active, onChange }: {
  icon: React.ReactNode; label: string; active: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ color: "var(--text-secondary)" }}>{icon}</span>
        <span style={{ fontSize: 13, color: "var(--text-primary)" }}>{label}</span>
      </div>
      <GlassToggle active={active} onChange={onChange} />
    </div>
  );
}

const sidebarWidthOptions = [
  { value: "200", label: "200px" },
  { value: "220", label: "220px" },
  { value: "240", label: "240px" },
  { value: "260", label: "260px" },
  { value: "280", label: "280px" },
];

const fontScaleOptions = [
  { value: "80", label: "80%" },
  { value: "90", label: "90%" },
  { value: "100", label: "100%" },
  { value: "110", label: "110%" },
  { value: "120", label: "120%" },
  { value: "140", label: "140%" },
];

export default function Settings() {
  const { lang, setLang } = useLanguage();
  const tx = t[lang];
  const { theme, settings, setTheme, updateSettings, resetSettings } = useTheme();
  const { confirm } = useConfirm();
  const { showToast } = useToast();
  const animationDuration = getAnimDuration(settings.animationSpeed);

  const [themePickerOpen, setThemePickerOpen] = useState(false);
  const [localVolume, setLocalVolume] = useState(80);

  useEffect(() => {
    window.electronAPI?.python.call("config.get").then((cfg: any) => {
      if (cfg?.musicVolume !== undefined) setLocalVolume(cfg.musicVolume);
      if (cfg?.autoStart !== undefined) updateSettings({ autoStart: cfg.autoStart } as any);
      if (cfg?.minimizeToTray !== undefined) updateSettings({ minimizeToTray: cfg.minimizeToTray } as any);
      if (cfg?.closeToTray !== undefined) updateSettings({ closeToTray: cfg.closeToTray } as any);
      if (cfg?.autoAdmin !== undefined) updateSettings({ autoAdmin: cfg.autoAdmin } as any);
      if (cfg?.autoResume !== undefined) updateSettings({ autoResume: cfg.autoResume } as any);
      if (cfg?.autoScan !== undefined) updateSettings({ autoScan: cfg.autoScan } as any);
    }).catch(() => {});
  }, []);

  const handleReset = async () => {
    const ok = await confirm({ title: tx.resetConfirm, danger: true });
    if (!ok) return;
    resetSettings();
    showToast(tx.resetConfirm, "success");
  };

  const onVolumeChange = (v: number) => {
    setLocalVolume(v);
    window.electronAPI?.python.call("config.set", { musicVolume: v });
  };

  const currentThemeOption = themeDropdownOptions.find(o => o.value === theme) ?? themeDropdownOptions[0];

  return (
    <motion.div animate={{ opacity: 1 }} transition={{ duration: animationDuration, ease: EASE_OUT }} style={{ maxWidth: 720, margin: "0 auto", width: "100%" }}>
      <h1 style={{ fontSize: 22, fontWeight: 600, color: "var(--text-primary)", marginBottom: 24, letterSpacing: "-0.02em" }}>
        {tx.title}
      </h1>

      {/* ── Appearance ── */}
      <div style={{ marginBottom: 24 }}>
        <h2 className="section-title" style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12, paddingLeft: 4 }}>
          <Eye size={12} style={{ display: "inline", verticalAlign: "middle" }} />
          {tx.appearance}
        </h2>
        <GlassCard>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

            {/* Theme selector */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {currentThemeOption.icon}
                <span style={{ fontSize: 13, color: "var(--text-primary)" }}>{tx.themeLabel}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500 }}>
                  {currentThemeOption.key.charAt(0).toUpperCase() + currentThemeOption.key.slice(1)}
                </span>
                <GlassButton variant="ghost" size="sm" onClick={() => setThemePickerOpen(true)}>
                  <Palette size={14} />
                </GlassButton>
              </div>
            </div>

            {/* Opacity slider */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{tx.opacity}</span>
                <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>{settings.windowOpacity}%</span>
              </div>
              <input type="range" min={70} max={100} value={settings.windowOpacity}
                onChange={(e) => updateSettings({ windowOpacity: Number(e.target.value) })}
                style={{ width: "100%" }} />
            </div>

            {/* Radius slider */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{tx.radius}</span>
                <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>{settings.borderRadius}px</span>
              </div>
              <input type="range" min={0} max={30} value={settings.borderRadius}
                onChange={(e) => updateSettings({ borderRadius: Number(e.target.value) })}
                style={{ width: "100%" }} />
            </div>

            {/* Animation speed */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <Zap size={14} style={{ color: "var(--text-secondary)" }} />
                <span style={{ fontSize: 13, color: "var(--text-primary)" }}>{tx.animSpeed}</span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <GlassButton
                  variant={settings.animationSpeed === "normal" ? "primary" : "secondary"}
                  size="sm"
                  onClick={() => updateSettings({ animationSpeed: "normal" })}
                >
                  {tx.animNormal}
                </GlassButton>
                <GlassButton
                  variant={settings.animationSpeed === "fast" ? "primary" : "secondary"}
                  size="sm"
                  onClick={() => updateSettings({ animationSpeed: "fast" })}
                >
                  {tx.animFast}
                </GlassButton>
                <GlassButton
                  variant={settings.animationSpeed === "off" ? "primary" : "secondary"}
                  size="sm"
                  onClick={() => updateSettings({ animationSpeed: "off" })}
                >
                  {tx.animOff}
                </GlassButton>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* ── Window Behavior ── */}
      <div style={{ marginBottom: 24 }}>
        <h2 className="section-title" style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12, paddingLeft: 4 }}>
          <Layout size={12} style={{ display: "inline", verticalAlign: "middle" }} />
          {tx.windowBehavior}
        </h2>
        <GlassCard>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <ToggleRow icon={<Zap size={14} />} label={tx.autoStart} active={(settings as any).autoStart ?? false} onChange={(v) => updateSettings({ autoStart: v } as any)} />
            <ToggleRow icon={<Layout size={14} />} label={tx.minToTray} active={(settings as any).minimizeToTray ?? false} onChange={(v) => updateSettings({ minimizeToTray: v } as any)} />
            <ToggleRow icon={<Layout size={14} />} label={tx.closeToTray} active={(settings as any).closeToTray ?? false} onChange={(v) => updateSettings({ closeToTray: v } as any)} />
            <ToggleRow icon={<Zap size={14} />} label={tx.autoAdmin} active={(settings as any).autoAdmin ?? false} onChange={(v) => updateSettings({ autoAdmin: v } as any)} />
            <ToggleRow icon={<Layout size={14} />} label={tx.rememberSize} active={settings.rememberSize} onChange={(v) => updateSettings({ rememberSize: v })} />
            <ToggleRow icon={<Layout size={14} />} label={tx.rememberPos} active={settings.rememberPosition} onChange={(v) => updateSettings({ rememberPosition: v })} />
          </div>
        </GlassCard>
      </div>

      {/* ── Music Settings ── */}
      <div style={{ marginBottom: 24 }}>
        <h2 className="section-title" style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12, paddingLeft: 4 }}>
          <Sliders size={12} style={{ display: "inline", verticalAlign: "middle" }} />
          {tx.musicSettings}
        </h2>
        <GlassCard>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{tx.defaultVol}</span>
                <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>{localVolume}%</span>
              </div>
              <input type="range" min={0} max={100} value={localVolume}
                onChange={(e) => onVolumeChange(Number(e.target.value))}
                style={{ width: "100%" }} />
            </div>
            <ToggleRow icon={<Zap size={14} />} label={tx.autoResume} active={(settings as any).autoResume ?? false} onChange={(v) => updateSettings({ autoResume: v } as any)} />
            <ToggleRow icon={<Zap size={14} />} label={tx.autoScan} active={(settings as any).autoScan ?? false} onChange={(v) => updateSettings({ autoScan: v } as any)} />
          </div>
        </GlassCard>
      </div>

      {/* ── Interface ── */}
      <div style={{ marginBottom: 24 }}>
        <h2 className="section-title" style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12, paddingLeft: 4 }}>
          <Type size={12} style={{ display: "inline", verticalAlign: "middle" }} />
          {tx.interface}
        </h2>
        <GlassCard>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Sidebar Width */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, color: "var(--text-primary)" }}>{tx.sidebarWidth}</span>
              <div style={{ width: 140 }}>
                <GlassSelect
                  value={String(settings.sidebarWidth)}
                  onChange={(v) => updateSettings({ sidebarWidth: Number(v) })}
                  options={sidebarWidthOptions}
                />
              </div>
            </div>

            {/* Font Scale */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, color: "var(--text-primary)" }}>{tx.fontScale}</span>
              <div style={{ width: 140 }}>
                <GlassSelect
                  value={String(settings.fontScale)}
                  onChange={(v) => updateSettings({ fontScale: Number(v) })}
                  options={fontScaleOptions}
                />
              </div>
            </div>

            {/* Compact toggle */}
            <ToggleRow icon={<Layout size={14} />} label={tx.compact} active={settings.compactMode}
              onChange={(v) => updateSettings({ compactMode: v, fontScale: v ? 90 : 100 })} />
          </div>
        </GlassCard>
      </div>

      {/* ── Language ── */}
      <div style={{ marginBottom: 24 }}>
        <h2 className="section-title" style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12, paddingLeft: 4 }}>
          <Globe size={12} style={{ display: "inline", verticalAlign: "middle" }} />
          {tx.language}
        </h2>
        <GlassCard>
          <div style={{ display: "flex", gap: 10 }}>
            <GlassButton variant={lang === "zh" ? "primary" : "secondary"}
              onClick={() => setLang("zh")} size="md" inline={false}>
              <Globe size={14} /> 中文
            </GlassButton>
            <GlassButton variant={lang === "en" ? "primary" : "secondary"}
              onClick={() => setLang("en")} size="md" inline={false}>
              <Globe size={14} /> English
            </GlassButton>
          </div>
        </GlassCard>
      </div>

      {/* ── Reset ── */}
      <div style={{ marginBottom: 24 }}>
        <GlassButton variant="danger" onClick={handleReset} inline={false} size="md"
          style={{ width: "100%", justifyContent: "center", padding: "12px 20px" }}>
          <RotateCcw size={14} /> {tx.resetSettings}
        </GlassButton>
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
          <GlassButton variant="secondary" size="sm"
            onClick={() => window.electronAPI?.shell.openExternal("https://github.com/YOU5A")}>
            {tx.github}
          </GlassButton>
          <GlassButton variant="secondary" size="sm"
            onClick={() => window.electronAPI?.shell.openExternal("https://space.bilibili.com/353017137")}>
            {tx.bilibli}
          </GlassButton>
          <GlassButton variant="secondary" size="sm"
            onClick={() => window.electronAPI?.shell.openExternal("https://you5a.github.io/UserTool")}>
            {tx.usertool}
          </GlassButton>
        </div>
      </GlassCard>

      {/* ── Theme Picker Modal ── */}
      <GlassModal open={themePickerOpen} onClose={() => setThemePickerOpen(false)} maxWidth={360}>
        <h3 style={{
          fontSize: 16, fontWeight: 600, color: "var(--text-primary)",
          margin: 0, letterSpacing: "-0.01em",
        }}>
          {tx.themeLabel}
        </h3>
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8,
        }}>
          {themeDropdownOptions.map((opt) => (
            <GlassButton
              key={opt.value}
              variant={theme === opt.value ? "primary" : "secondary"}
              size="sm"
              inline={false}
              onClick={() => { setTheme(opt.value); setThemePickerOpen(false); }}
            >
              {opt.icon}
              {opt.key.charAt(0).toUpperCase() + opt.key.slice(1)}
            </GlassButton>
          ))}
        </div>
      </GlassModal>
    </motion.div>
  );
}
