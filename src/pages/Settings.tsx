import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sun, Moon, Monitor, Globe, Palette,
  Layout, Type, Zap, Eye, RotateCcw
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/hooks/useTheme";
import { useConfirm } from "@/contexts/ConfirmContext";
import { useToast } from "@/contexts/ToastContext";
import { APP_VERSION } from "@/version";
import GlassCard from "@/components/GlassCard";
import { GlassButton, GlassInput, GlassModal, GlassSelect, GlassToggle, springDefault, space, fontSizes, radii } from "@/design-system";
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
    closeToTray: "关闭到托盘",
    rememberSize: "记住窗口大小",
    rememberPos: "记住窗口位置",
    interface: "界面设置",
    sidebarWidth: "侧边栏宽度",
    sidebarWidthSub: "Sidebar Width",
    fontScale: "界面缩放",
    fontScaleSub: "UI Scale",
    compact: "紧凑模式",
    standard: "中等模式",
    large: "标准",
    resetSettings: "重置所有设置",
    resetToDefault: "恢复默认",
    resetConfirm: "确定要恢复默认设置吗？",
    themeTitle: "选择配色方案",
    themeSub: "Choose a color scheme",
    themeReset: "恢复默认",
    about: "关于",
    aboutTitle: "Codes Suite",
    aboutVersion: `版本 ${APP_VERSION}`,
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
    closeToTray: "Close to Tray",
    rememberSize: "Remember Window Size",
    rememberPos: "Remember Window Position",
    interface: "Interface",
    sidebarWidth: "Sidebar Width",
    sidebarWidthSub: "Adjust sidebar width",
    fontScale: "UI Scale",
    fontScaleSub: "Adjust interface scale",
    compact: "Compact",
    standard: "Medium",
    large: "Standard",
    resetSettings: "Reset All Settings",
    resetToDefault: "Reset to Default",
    resetConfirm: "Restore default settings?",
    themeTitle: "Choose Theme",
    themeSub: "Choose a color scheme",
    themeReset: "Reset to Default",
    about: "About",
    aboutTitle: "Codes Suite",
    aboutVersion: `Version ${APP_VERSION}`,
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
  { value: "crimson", icon: <Moon size={16} />, key: "crimson" },
];

const themeColorMap: Record<Theme, string> = {
  light: "#0071e3",
  dark: "#1a2a4a",
  auto: "transparent",
  graphite: "#5856d6",
  midnight: "#6366f1",
  ocean: "#0066cc",
  emerald: "#059669",
  crimson: "#f43f5e",
};


function ToggleRow({ icon, label, active, onChange }: {
  icon: React.ReactNode; label: string; active: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: space[2] }}>
        <span style={{ color: "var(--text-secondary)" }}>{icon}</span>
        <span style={{ fontSize: fontSizes.md, color: "var(--text-primary)" }}>{label}</span>
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

  useEffect(() => {
    window.electronAPI?.python.call("config.get").then((cfg: any) => {
    }).catch(() => {});
    // Load Electron-side settings
    window.electronAPI?.settings.getAll().then((s: any) => {
      if (s?.autoStart !== undefined) updateSettings({ autoStart: s.autoStart } as any);
      if (s?.closeToTray !== undefined) updateSettings({ closeToTray: s.closeToTray } as any);
      if (s?.rememberSize !== undefined) updateSettings({ rememberSize: s.rememberSize });
      if (s?.rememberPosition !== undefined) updateSettings({ rememberPosition: s.rememberPosition });
    }).catch(() => {});
  }, []);

  const handleReset = async () => {
    const ok = await confirm({ title: tx.resetConfirm, danger: true });
    if (!ok) return;
    resetSettings();
    showToast(tx.resetConfirm, "success");
  };

  // 光标跟随白色光晕（匹配 GlassButton）
  const setPillGlow = useCallback((el: HTMLElement, cx: number, cy: number) => {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    el.style.setProperty("--pill-gx", ((cx - r.left) / r.width) * 100 + "%");
    el.style.setProperty("--pill-gy", ((cy - r.top) / r.height) * 100 + "%");
    el.style.setProperty("--pill-go", "1");
  }, []);

  const clearPillGlow = useCallback((el: HTMLElement) => {
    el.style.setProperty("--pill-go", "0");
  }, []);

  const handlePillMove = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    setPillGlow(e.currentTarget, e.clientX, e.clientY);
  }, [setPillGlow]);

  const handlePillLeave = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    clearPillGlow(e.currentTarget);
  }, [clearPillGlow]);


  const currentThemeOption = themeDropdownOptions.find(o => o.value === theme) ?? themeDropdownOptions[0];

  return (
    <motion.div animate={{ opacity: 1 }} transition={{ duration: animationDuration, ease: EASE_OUT }} style={{ maxWidth: 720, margin: "0 auto", width: "100%" }}>
      <h1 style={{ fontSize: fontSizes["2xl"], fontWeight: 600, color: "var(--text-primary)", marginBottom: space[6], letterSpacing: "-0.02em" }}>
        {tx.title}
      </h1>

      {/* ── Appearance ── */}
      <div style={{ marginBottom: space[6] }}>
        <h2 className="section-title" style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: space[3], paddingLeft: space[1] }}>
          <Eye size={12} style={{ display: "inline", verticalAlign: "middle" }} />
          {tx.appearance}
        </h2>
        <GlassCard>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

            {/* Theme selector */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: space[2] }}>
                {currentThemeOption.icon}
                <span style={{ fontSize: fontSizes.md, color: "var(--text-primary)" }}>{tx.themeLabel}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: space[2] }}>
                <span style={{ fontSize: fontSizes.md, color: "var(--text-secondary)", fontWeight: 500 }}>
                  {tx[currentThemeOption.key]}
                </span>
                <GlassButton variant="ghost" size="sm" onClick={() => setThemePickerOpen(true)}>
                  <Palette size={14} />
                </GlassButton>
              </div>
            </div>

            {/* Opacity slider */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: fontSizes.sm, color: "var(--text-secondary)" }}>{tx.opacity}</span>
                <span style={{ fontSize: fontSizes.sm, color: "var(--text-tertiary)" }}>{settings.windowOpacity}%</span>
              </div>
              <input type="range" min={70} max={100} value={settings.windowOpacity}
                onChange={(e) => updateSettings({ windowOpacity: Number(e.target.value) })}
                style={{ width: "100%" }} />
            </div>

            {/* Radius slider */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: fontSizes.sm, color: "var(--text-secondary)" }}>{tx.radius}</span>
                <span style={{ fontSize: fontSizes.sm, color: "var(--text-tertiary)" }}>{settings.borderRadius}px</span>
              </div>
              <input type="range" min={0} max={30} value={settings.borderRadius}
                onChange={(e) => updateSettings({ borderRadius: Number(e.target.value) })}
                style={{ width: "100%" }} />
            </div>

            {/* Animation speed */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: space[2], marginBottom: space[2] }}>
                <Zap size={14} style={{ color: "var(--text-secondary)" }} />
                <span style={{ fontSize: fontSizes.md, color: "var(--text-primary)" }}>{tx.animSpeed}</span>
              </div>
              <div style={{ display: "flex", gap: space[2] }}>
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
      <div style={{ marginBottom: space[6] }}>
        <h2 className="section-title" style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: space[3], paddingLeft: space[1] }}>
          <Layout size={12} style={{ display: "inline", verticalAlign: "middle" }} />
          {tx.windowBehavior}
        </h2>
        <GlassCard>
          <div style={{ display: "flex", flexDirection: "column", gap: space[4] }}>
            <ToggleRow icon={<Zap size={14} />} label={tx.autoStart} active={(settings as any).autoStart ?? false} onChange={(v) => { updateSettings({ autoStart: v } as any); window.electronAPI?.settings.set('autoStart', v); }} />            <ToggleRow icon={<Layout size={14} />} label={tx.closeToTray} active={(settings as any).closeToTray ?? false} onChange={(v) => { updateSettings({ closeToTray: v } as any); window.electronAPI?.settings.set('closeToTray', v); }} />
            
            <ToggleRow icon={<Layout size={14} />} label={tx.rememberSize} active={settings.rememberSize} onChange={(v) => { updateSettings({ rememberSize: v }); window.electronAPI?.settings.set('rememberSize', v); }} />
            <ToggleRow icon={<Layout size={14} />} label={tx.rememberPos} active={settings.rememberPosition} onChange={(v) => { updateSettings({ rememberPosition: v }); window.electronAPI?.settings.set('rememberPosition', v); }} />
          </div>
        </GlassCard>
      </div>


      {/* ── Interface ── */}
      <div style={{ marginBottom: space[6] }}>
        <h2 className="section-title" style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: space[3], paddingLeft: space[1] }}>
          <Type size={12} style={{ display: "inline", verticalAlign: "middle" }} />
          {tx.interface}
        </h2>
        <GlassCard>
          <div style={{ display: "flex", flexDirection: "column", gap: space[4] }}>
            {/* Sidebar Width */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: fontSizes.md, color: "var(--text-primary)" }}>{tx.sidebarWidth}</span>
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
              <span style={{ fontSize: fontSizes.md, color: "var(--text-primary)" }}>{tx.fontScale}</span>
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
              onChange={(v) => updateSettings({ compactMode: v, fontScale: v ? 90 : 120 })} />
          </div>
        </GlassCard>
      </div>

      {/* ── Language ── */}
      <div style={{ marginBottom: space[6] }}>
        <h2 className="section-title" style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: space[3], paddingLeft: space[1] }}>
          <Globe size={12} style={{ display: "inline", verticalAlign: "middle" }} />
          {tx.language}
        </h2>
        <GlassCard>
          <div style={{ display: "flex", gap: space[3] }}>
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
      <div style={{ marginBottom: space[6] }}>
        <GlassButton variant="danger" onClick={handleReset} inline={false} size="md"
          style={{ width: "100%", justifyContent: "center", padding: `${space[3]}px ${space[5]}px` }}>
          <RotateCcw size={14} /> {tx.resetSettings}
        </GlassButton>
      </div>

      {/* ── About ── */}
      <GlassCard style={{ marginBottom: space[6] }}>
        <div style={{ display: "flex", alignItems: "center", gap: space[3], marginBottom: space[3] }}>
          <img src="./icon.png" alt="" style={{ width: 48, height: 48, borderRadius: radii.md }} />
          <div>
            <div style={{ fontSize: fontSizes.lg, fontWeight: 600, color: "var(--text-primary)" }}>{tx.aboutTitle}</div>
            <div style={{ fontSize: fontSizes.xs, color: "var(--text-tertiary)" }}>{tx.aboutVersion}</div>
          </div>
        </div>
        <div style={{ fontSize: fontSizes.sm, color: "var(--text-tertiary)", lineHeight: 1.8 }}>
          <div>{tx.aboutDesc}</div>
          <div>{tx.aboutAuthor}</div>
          <div>{tx.aboutTech}</div>
        </div>
        <div style={{ display: "flex", gap: space[2], marginTop: space[3] }}>
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
      <GlassModal open={themePickerOpen} onClose={() => setThemePickerOpen(false)} maxWidth={400}>
        {/* Header */}
        <div style={{ marginBottom: 14 }}>
          <h3 style={{
            fontSize: fontSizes.lg, fontWeight: 600, color: "var(--text-primary)",
            margin: "0 0 2px 0", letterSpacing: "-0.01em",
          }}>
            {tx.themeLabel}
          </h3>
          <p style={{ fontSize: 12, color: "var(--text-tertiary)", margin: 0 }}>
            {tx.themeSub}
          </p>
        </div>

        <div style={{ height: 1, background: "var(--border-color)", opacity: 0.5, marginBottom: 16 }} />

        {/* Theme pills */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {themeDropdownOptions.map((opt) => {
            const active = theme === opt.value;
            const colorDot = themeColorMap[opt.value];
            return (
              <button
                className="theme-pill"
                key={opt.value}
                onClick={() => { setTheme(opt.value); setThemePickerOpen(false); }}
                onMouseMove={handlePillMove}
                onMouseEnter={handlePillMove}
                onMouseLeave={handlePillLeave}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 16px",
                  borderRadius: 20,
                  border: `1.5px solid ${active ? "var(--accent)" : "var(--border-color)"}`,
                  background: active ? "var(--accent-bg)" : "transparent",
                  color: active ? "var(--accent)" : "var(--text-secondary)",
                  fontSize: 13,
                  fontWeight: active ? 600 : 400,
                  cursor: "pointer",
                  transition: "all var(--transition-fast)",
                  lineHeight: 1,
                }}
              >
                <span style={{ display: "flex", alignItems: "center" }}>
                  {opt.icon}
                </span>
                {tx[opt.key]}
                {opt.value !== "auto" ? (
                  <span style={{
                    width: 12, height: 12, borderRadius: "50%",
                    background: colorDot,
                    border: "1px solid rgba(128,128,128,0.3)",
                    flexShrink: 0,
                  }} />
                ) : (
                  <span style={{
                    display: "flex",
                    gap: 0,
                    width: 14, height: 12,
                    flexShrink: 0,
                  }}>
                    <span style={{
                      width: 7, height: 12,
                      borderRadius: "6px 0 0 6px",
                      background: "#1C1C1E",
                      border: "1px solid rgba(128,128,128,0.3)",
                      borderRight: "none",
                    }} />
                    <span style={{
                      width: 7, height: 12,
                      borderRadius: "0 6px 6px 0",
                      background: "#0a84ff",
                      border: "1px solid rgba(128,128,128,0.3)",
                      borderLeft: "none",
                    }} />
                  </span>
                )}
                <span className="theme-pill-glow" />
              </button>
            );
          })}
        </div>

        <div style={{ height: 1, background: "var(--border-color)", opacity: 0.5, margin: "16px 0" }} />

        {/* Reset */}
        <button
          className="theme-pill"
          onClick={() => { setTheme("auto"); setThemePickerOpen(false); }}
          onMouseMove={handlePillMove}
          onMouseEnter={handlePillMove}
          onMouseLeave={handlePillLeave}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            width: "100%",
            padding: "7px 0",
            borderRadius: 16,
            border: "1.5px solid var(--border-color)",
            background: "transparent",
            color: "var(--text-tertiary)",
            fontSize: 12,
            fontWeight: 500,
            cursor: "pointer",
            transition: "all var(--transition-fast)",
          }}
        >
          <RotateCcw size={12} />
          {tx.themeReset}
          <span className="theme-pill-glow" />
        </button>
      </GlassModal>
    </motion.div>
  );
}

