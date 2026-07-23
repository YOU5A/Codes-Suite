/**
 * FluidSettingsPanel — 流体背景设置面板
 * 使用 GlassModal 承载，控制 FluidBackground 各项参数
 */

import type { FC } from "react";
import { GlassModal, GlassToggle, GlassButton, GlassSurface } from "@/design-system";
import type { FluidPresetId } from "@/components/FluidBackground/config";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Language } from "@/types";

// ── 类型 ──

export interface FluidSettingsValues {
  enabled: boolean;
  speedMultiplier: number;
  style: FluidPresetId | "auto";
  fps: 30 | 60;
  intensity: number;
  blurAmount: number;
  colorMode: "auto" | "cover" | "dynamic";
}

export const DEFAULT_FLUID_SETTINGS: FluidSettingsValues = {
  enabled: false,
  speedMultiplier: 1.0,
  style: "auto",
  fps: 60,
  intensity: 0.5,
  blurAmount: 0,
  colorMode: "auto",
};

const FLUID_SETTINGS_KEY = "fluidSettings";

export function loadFluidSettings(): FluidSettingsValues {
  try {
    const raw = localStorage.getItem(FLUID_SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_FLUID_SETTINGS, ...parsed };
    }
  } catch {
    console.warn("[FluidSettings] Configuration load failed, using defaults");
  }
  return { ...DEFAULT_FLUID_SETTINGS };
}

export function saveFluidSettings(values: FluidSettingsValues): void {
  try {
    localStorage.setItem(FLUID_SETTINGS_KEY, JSON.stringify(values));
    window.dispatchEvent(new CustomEvent("fluidSettingsChanged"));
  } catch {
    console.warn("[FluidSettings] Configuration save failed");
  }
}

interface FluidSettingsPanelProps {
  open: boolean;
  onClose: () => void;
  values: FluidSettingsValues;
  onChange: (values: FluidSettingsValues) => void;
}

// ── 风格选项 ──

const STYLE_OPTIONS: { id: FluidPresetId | "auto"; label: { zh: string; en: string } }[] = [
  { id: "auto", label: { zh: "自动", en: "Auto" } },
  { id: "cover", label: { zh: "封面颜色", en: "Cover Color" } },
  { id: "aurora", label: { zh: "极光", en: "Aurora" } },
  { id: "ocean", label: { zh: "深海", en: "Ocean" } },
  { id: "nebula", label: { zh: "星云", en: "Nebula" } },
  { id: "plasma", label: { zh: "等离子", en: "Plasma" } },
  { id: "ember", label: { zh: "余烬", en: "Ember" } },
  { id: "forest", label: { zh: "森林", en: "Forest" } },
];

const COLOR_MODE_OPTIONS: { id: FluidSettingsValues["colorMode"]; label: { zh: string; en: string } }[] = [
  { id: "auto", label: { zh: "自动", en: "Auto" } },
  { id: "dynamic", label: { zh: "动态彩色", en: "Dynamic" } },
  { id: "cover", label: { zh: "封面颜色", en: "Cover Color" } },
];

// ── 样式常量 ──

const labelStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 500,
  color: "var(--text-primary)",
  minWidth: 56,
  flexShrink: 0,
};

const sublabelStyle: React.CSSProperties = {
  fontSize: 11,
  color: "var(--text-tertiary)",
  marginTop: 2,
};

const rowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "6px 0",
  gap: 12,
};

const sectionStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
};

const separatorStyle: React.CSSProperties = {
  height: 1,
  background: "var(--border-color)",
  opacity: 0.5,
  margin: "4px 0",
};

// ── Translations ──

const t: Record<Language, Record<string, string>> = {
  zh: {
    title: "流体背景设置",
    subtitle: "Fluid Background Settings",
    enable: "开启背景",
    enableSub: "Enable Background",
    speed: "速度",
    speedSub: "Speed",
    colorMode: "颜色模式",
    colorModeSub: "Color Mode",
    frameRate: "帧率",
    frameRateSub: "Frame Rate",
    intensity: "强度",
    intensitySub: "Intensity",
    blur: "模糊",
    blurSub: "Blur (Coming Soon)",
    style: "风格",
    styleSub: "Style",
    reset: "恢复默认",
    resetTitle: "恢复默认设置",
  },
  en: {
    title: "Fluid Background",
    subtitle: "Fluid Background Settings",
    enable: "Enable Background",
    enableSub: "Enable Background",
    speed: "Speed",
    speedSub: "Speed",
    colorMode: "Color Mode",
    colorModeSub: "Color Mode",
    frameRate: "Frame Rate",
    frameRateSub: "Frame Rate",
    intensity: "Intensity",
    intensitySub: "Intensity",
    blur: "Blur",
    blurSub: "Blur (Coming Soon)",
    style: "Style",
    styleSub: "Style",
    reset: "Reset Defaults",
    resetTitle: "Reset to default settings",
  },
};

// ── Component ──

const FluidSettingsPanel: FC<FluidSettingsPanelProps> = ({ open, onClose, values, onChange }) => {
  const { lang } = useLanguage();
  const tx = t[lang];
  const set = <K extends keyof FluidSettingsValues>(key: K, value: FluidSettingsValues[K]) => {
    onChange({ ...values, [key]: value });
  };

  // Cursor-following white glow (same as GlassSelect)
  const setPillGlow = (el: HTMLElement, cx: number, cy: number) => {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    el.style.setProperty("--pill-gx", ((cx - r.left) / r.width) * 100 + "%");
    el.style.setProperty("--pill-gy", ((cy - r.top) / r.height) * 100 + "%");
    el.style.setProperty("--pill-go", "1");
  };
  const clearPillGlow = (el: HTMLElement) => {
    el.style.setProperty("--pill-go", "0");
  };
  const dim = values.enabled ? 1 : 0.35;

  return (
    <GlassModal open={open} onClose={onClose} maxWidth={360}>
      <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Title + Reset */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <h3 style={{ fontSize: 17, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>
            {tx.title}
          </h3>
          <button
            onClick={() => onChange({ ...DEFAULT_FLUID_SETTINGS })}
            style={{
              padding: "3px 12px",
              borderRadius: 14,
              border: "1px solid var(--border-color)",
              background: "transparent",
              color: "var(--text-secondary)",
              fontSize: 11,
              fontWeight: 500,
              cursor: "pointer",
              transition: "all var(--transition-fast)",
            }}
            title={tx.resetTitle}
          >
            {tx.reset}
          </button>
        </div>

        <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: -8 }}>
          {tx.subtitle}
        </div>

        {/* ── 开启背景 ── */}
        <div style={rowStyle}>
          <div>
            <div style={labelStyle}>{tx.enable}</div>
            <div style={sublabelStyle}>{tx.enableSub}</div>
          </div>
          <GlassToggle active={values.enabled} onChange={(v) => set("enabled", v)} />
        </div>

        <div style={separatorStyle} />

        {/* ── 速度 ── */}
        <div style={sectionStyle}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <div style={{...labelStyle, opacity: dim}}>{tx.speed}</div>
              <div style={{...sublabelStyle, opacity: dim * 0.8}}>{tx.speedSub}</div>
            </div>
            <span style={{ fontSize: 12, color: "var(--text-secondary)", fontVariantNumeric: "tabular-nums", opacity: dim }}>
              {values.speedMultiplier.toFixed(1)}x
            </span>
          </div>
          <input
            type="range"
            min={0.1}
            max={3.0}
            step={0.1}
            value={values.speedMultiplier}
            onChange={(e) => set("speedMultiplier", parseFloat(e.target.value))}
            disabled={!values.enabled}
            style={{
              width: "100%",
              accentColor: "var(--accent)",
              opacity: values.enabled ? 1 : 0.4,
            }}
          />
        </div>

        <div style={separatorStyle} />

        {/* ── 颜色模式 ── */}
        <div style={sectionStyle}>
          <div>
            <div style={{...labelStyle, opacity: dim}}>{tx.colorMode}</div>
            <div style={{...sublabelStyle, opacity: dim * 0.8}}>{tx.colorModeSub}</div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {COLOR_MODE_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                className="theme-pill"
                onClick={() => set("colorMode", opt.id)}
                disabled={!values.enabled}
                onMouseMove={(e) => setPillGlow(e.currentTarget, e.clientX, e.clientY)}
                onMouseEnter={(e) => setPillGlow(e.currentTarget, e.clientX, e.clientY)}
                onMouseLeave={(e) => clearPillGlow(e.currentTarget)}
                style={{
                  padding: "5px 12px",
                  borderRadius: 20,
                  border: `1.5px solid ${values.colorMode === opt.id ? "var(--accent)" : "var(--border-color)"}`,
                  background: values.colorMode === opt.id ? "var(--accent-bg)" : "transparent",
                  color: values.colorMode === opt.id ? "var(--accent)" : "var(--text-secondary)",
                  fontSize: 12,
                  fontWeight: values.colorMode === opt.id ? 600 : 400,
                  cursor: values.enabled ? "pointer" : "not-allowed",
                  opacity: values.enabled ? 1 : 0.4,
                  transition: "all var(--transition-fast)",
                  boxShadow: values.colorMode === opt.id ? "0 0 12px rgba(255,255,255,0.25), 0 0 4px rgba(255,255,255,0.15)" : "none",
                  fontFamily: "inherit",
                  outline: "none",
                }}
              >
                {opt.label[lang]}
                <span className="theme-pill-glow" />
              </button>
            ))}
          </div>
        </div><div style={separatorStyle} />

        {/* ── 帧率 ── */}
        <div style={rowStyle}>
          <div>
            <div style={{...labelStyle, opacity: dim}}>{tx.frameRate}</div>
            <div style={{...sublabelStyle, opacity: dim * 0.8}}>{tx.frameRateSub}</div>
          </div>
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            {([30, 60] as const).map((fps) => (
              <button
                key={fps}
                className="theme-pill"
                onClick={() => set("fps", fps)}
                disabled={!values.enabled}
                onMouseMove={(e) => setPillGlow(e.currentTarget, e.clientX, e.clientY)}
                onMouseEnter={(e) => setPillGlow(e.currentTarget, e.clientX, e.clientY)}
                onMouseLeave={(e) => clearPillGlow(e.currentTarget)}
                style={{
                  padding: "3px 14px",
                  borderRadius: 16,
                  border: `1.5px solid ${values.fps === fps ? "var(--accent)" : "var(--border-color)"}`,
                  background: values.fps === fps ? "var(--accent-bg)" : "transparent",
                  color: values.fps === fps ? "var(--accent)" : "var(--text-secondary)",
                  fontSize: 12,
                  fontWeight: values.fps === fps ? 600 : 400,
                  cursor: values.enabled ? "pointer" : "not-allowed",
                  opacity: values.enabled ? 1 : 0.4,
                  transition: "all var(--transition-fast)",
                  boxShadow: values.fps === fps ? "0 0 12px rgba(255,255,255,0.25), 0 0 4px rgba(255,255,255,0.15)" : "none",
                  fontFamily: "inherit",
                  outline: "none",
                }}
              >
                {fps} FPS
                <span className="theme-pill-glow" />
              </button>
            ))}
          </div>
        </div>

        <div style={separatorStyle} />

        {/* ── 强度 ── */}
        <div style={sectionStyle}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <div style={{...labelStyle, opacity: dim}}>{tx.intensity}</div>
              <div style={{...sublabelStyle, opacity: dim * 0.8}}>{tx.intensitySub}</div>
            </div>
            <span style={{ fontSize: 12, color: "var(--text-secondary)", fontVariantNumeric: "tabular-nums", opacity: dim }}>
              {Math.round(values.intensity * 100)}%
            </span>
          </div>
          <input
            type="range"
            min={0.05}
            max={1.0}
            step={0.05}
            value={values.intensity}
            onChange={(e) => set("intensity", parseFloat(e.target.value))}
            disabled={!values.enabled}
            style={{
              width: "100%",
              accentColor: "var(--accent)",
              opacity: values.enabled ? 1 : 0.4,
            }}
          />
        </div>

        <div style={separatorStyle} />

        {/* ── 模糊 ── */}
        <div style={sectionStyle}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <div style={{...labelStyle, opacity: 0.35}}>{tx.blur}</div>
              <div style={{...sublabelStyle, opacity: dim * 0.8}}>Blur (Coming Soon)</div>
            </div>
            <span style={{ fontSize: 12, color: "var(--text-tertiary)", fontVariantNumeric: "tabular-nums", opacity: 0.4 }}>
              N/A
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={1.0}
            step={0.05}
            value={0}
            onChange={(e) => set("blurAmount", parseFloat(e.target.value))}
            disabled={true}
            style={{
              width: "100%",
              accentColor: "var(--text-tertiary)",
              opacity: 0.3,
              cursor: "not-allowed",
            }}
          />
        </div>

        <div style={separatorStyle} />

        {/* ── 风格 ── */}
        <div style={sectionStyle}>
          <div>
            <div style={{...labelStyle, opacity: dim}}>{tx.style}</div>
            <div style={{...sublabelStyle, opacity: dim * 0.8}}>{tx.styleSub}</div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {STYLE_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                className="theme-pill"
                onClick={() => set("style", opt.id)}
                disabled={!values.enabled}
                onMouseMove={(e) => setPillGlow(e.currentTarget, e.clientX, e.clientY)}
                onMouseEnter={(e) => setPillGlow(e.currentTarget, e.clientX, e.clientY)}
                onMouseLeave={(e) => clearPillGlow(e.currentTarget)}
                style={{
                  padding: "5px 12px",
                  borderRadius: 20,
                  border: `1.5px solid ${values.style === opt.id ? "var(--accent)" : "var(--border-color)"}`,
                  background: values.style === opt.id ? "var(--accent-bg)" : "transparent",
                  color: values.style === opt.id ? "var(--accent)" : "var(--text-secondary)",
                  fontSize: 12,
                  fontWeight: values.style === opt.id ? 600 : 400,
                  cursor: values.enabled ? "pointer" : "not-allowed",
                  opacity: values.enabled ? 1 : 0.4,
                  transition: "all var(--transition-fast)",
                  boxShadow: values.style === opt.id ? "0 0 12px rgba(255,255,255,0.25), 0 0 4px rgba(255,255,255,0.15)" : "none",
                  fontFamily: "inherit",
                  outline: "none",
                }}
              >
                {opt.label[lang]}
                <span className="theme-pill-glow" />
              </button>
            ))}
          </div>
        </div>

        
      </div>
    </GlassModal>
  );
};

export default FluidSettingsPanel;
