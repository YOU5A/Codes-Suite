/**
 * FluidSettingsPanel — 流体背景设置面板
 * 使用 GlassModal 承载，控制 FluidBackground 各项参数
 */

import type { FC } from "react";
import { GlassModal, GlassToggle, GlassButton, GlassSurface } from "@/design-system";
import type { FluidPresetId } from "@/components/FluidBackground/config";

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
  enabled: true,
  speedMultiplier: 1.0,
  style: "auto",
  fps: 60,
  intensity: 0.6,
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

// ── 组件 ──

const FluidSettingsPanel: FC<FluidSettingsPanelProps> = ({ open, onClose, values, onChange }) => {
  const set = <K extends keyof FluidSettingsValues>(key: K, value: FluidSettingsValues[K]) => {
    onChange({ ...values, [key]: value });
  };

  return (
    <GlassModal open={open} onClose={onClose} maxWidth={360}>
      <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
        {/* 标题 */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <h3 style={{ fontSize: 17, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>
            流体背景设置
          </h3>
        </div>

        <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: -8 }}>
          Fluid Background Settings
        </div>

        {/* ── 开启背景 ── */}
        <div style={rowStyle}>
          <div>
            <div style={labelStyle}>开启背景</div>
            <div style={sublabelStyle}>Enable Background</div>
          </div>
          <GlassToggle active={values.enabled} onChange={(v) => set("enabled", v)} />
        </div>

        <div style={separatorStyle} />

        {/* ── 速度 ── */}
        <div style={sectionStyle}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <div style={labelStyle}>速度</div>
              <div style={sublabelStyle}>Speed</div>
            </div>
            <span style={{ fontSize: 12, color: "var(--text-secondary)", fontVariantNumeric: "tabular-nums" }}>
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

        {/* ── 风格 ── */}
        <div style={sectionStyle}>
          <div>
            <div style={labelStyle}>风格</div>
            <div style={sublabelStyle}>Style</div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {STYLE_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => set("style", opt.id)}
                disabled={!values.enabled}
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
                }}
              >
                {opt.label.zh}
              </button>
            ))}
          </div>
        </div>

        <div style={separatorStyle} />

        {/* ── 帧率 ── */}
        <div style={rowStyle}>
          <div>
            <div style={labelStyle}>帧率</div>
            <div style={sublabelStyle}>Frame Rate</div>
          </div>
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            {([30, 60] as const).map((fps) => (
              <button
                key={fps}
                onClick={() => set("fps", fps)}
                disabled={!values.enabled}
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
                }}
              >
                {fps} FPS
              </button>
            ))}
          </div>
        </div>

        <div style={separatorStyle} />

        {/* ── 强度 ── */}
        <div style={sectionStyle}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <div style={labelStyle}>强度</div>
              <div style={sublabelStyle}>Intensity</div>
            </div>
            <span style={{ fontSize: 12, color: "var(--text-secondary)", fontVariantNumeric: "tabular-nums" }}>
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
              <div style={labelStyle}>模糊</div>
              <div style={sublabelStyle}>Blur</div>
            </div>
            <span style={{ fontSize: 12, color: "var(--text-secondary)", fontVariantNumeric: "tabular-nums" }}>
              {Math.round(values.blurAmount * 100)}%
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={1.0}
            step={0.05}
            value={values.blurAmount}
            onChange={(e) => set("blurAmount", parseFloat(e.target.value))}
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
            <div style={labelStyle}>颜色模式</div>
            <div style={sublabelStyle}>Color Mode</div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {COLOR_MODE_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => set("colorMode", opt.id)}
                disabled={!values.enabled}
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
                }}
              >
                {opt.label.zh}
              </button>
            ))}
          </div>
        </div>
      </div>
    </GlassModal>
  );
};

export default FluidSettingsPanel;
