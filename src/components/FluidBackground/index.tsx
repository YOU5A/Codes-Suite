/**
 * FluidBackground React 组件
 * 挂载 Canvas, 管理 FluidRenderer 生命周期
 * 不依赖任何 Context 或全局状态
 */

import { useEffect, useRef, useCallback, type FC } from "react";
import { FluidRenderer } from "./renderer";
import type { FluidConfig, FluidPresetId } from "./config";
import { DEFAULT_CONFIG, loadConfig } from "./config";

export interface FluidBackgroundProps {
  /** 预设, 默认 "auto" (主题自适应) */
  preset?: FluidPresetId | "auto";
  /** 整体不透明度 0-1, 默认 0.6 */
  intensity?: number;
  /** 画质, 默认 "medium" */
  quality?: "low" | "medium" | "high";
  /** 是否响应鼠标交互, 默认 true */
  interactive?: boolean;
  /** 总开关, 默认 true */
  enabled?: boolean;
  /** 速度倍率 0.1-3.0, 默认 1.0 */
  speedMultiplier?: number;
  /** 模糊程度 0-1, 默认 0 */
  blurAmount?: number;
  /** 颜色模式, 默认 "auto" */
  colorMode?: "auto" | "cover" | "dynamic";
  /** 封面颜色 RGB, 仅在 colorMode="cover" */
  coverColor?: [number, number, number] | null;
  /** 目标帧率 (30/60), 默认 60 */
  targetFps?: number;
  /** 额外 CSS 类名 */
  className?: string;
}

const FluidBackground: FC<FluidBackgroundProps> = ({
  preset,
  intensity,
  quality,
  interactive,
  enabled,
  speedMultiplier,
  blurAmount,
  colorMode,
  coverColor,
  targetFps,
  className,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<FluidRenderer | null>(null);
  const configRef = useRef<FluidConfig>({ ...DEFAULT_CONFIG, ...loadConfig() });

  // 合并 props 到运行时配置
  const mergedConfig: FluidConfig = {
    ...configRef.current,
    ...(preset !== undefined ? { preset } : {}),
    ...(intensity !== undefined ? { intensity } : {}),
    ...(quality !== undefined ? { quality } : {}),
    ...(interactive !== undefined ? { interactive } : {}),
    ...(enabled !== undefined ? { enabled } : {}),
    ...(speedMultiplier !== undefined ? { speedMultiplier } : {}),
    ...(blurAmount !== undefined ? { blurAmount } : {}),
    ...(colorMode !== undefined ? { colorMode } : {}),
  };

  // ---------- 初始化 / 销毁 ----------

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new FluidRenderer(canvas, mergedConfig);
    rendererRef.current = renderer;

    // 初始尺寸
    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.resize(w, h);
    };
    resize();

    // ResizeObserver
    const ro = new ResizeObserver(() => resize());
    ro.observe(document.documentElement);

    // 可见性
    const visHandler = () => {
      renderer.setVisible(!document.hidden && mergedConfig.enabled);
    };
    document.addEventListener("visibilitychange", visHandler);

    // Apply cover color synchronously before first render to avoid flash
    if (coverColor) {
      renderer.setCoverColor(coverColor);
    }

    // Start if enabled
    if (mergedConfig.enabled) {
      renderer.start();
    }

    return () => {
      ro.disconnect();
      document.removeEventListener("visibilitychange", visHandler);
      renderer.destroy();
      rendererRef.current = null;
    };
    // 仅在挂载/卸载时运行
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- Props change ----------

  useEffect(() => {
    const r = rendererRef.current;
    if (!r) return;
    r.updateConfig({
      preset,
      intensity,
      quality,
      interactive,
      enabled,
      speedMultiplier,
      blurAmount,
      colorMode,
    });
    // Explicitly start/stop based on enabled flag
    if (enabled === false) {
      r.stop();
    } else if (enabled === true) {
      r.start();
    }
  }, [preset, intensity, quality, interactive, enabled, speedMultiplier, blurAmount, colorMode]);

  // 封面颜色
  useEffect(() => {
    rendererRef.current?.setCoverColor(coverColor ?? null);
  }, [coverColor]);

  // FPS 设置
  useEffect(() => {
    if (targetFps) {
      rendererRef.current?.setTargetFps(targetFps);
    }
  }, [targetFps]);

  // ---------- 鼠标交互 ----------

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!mergedConfig.interactive) return;
      const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width;
      const ny = (e.clientY - rect.top) / rect.height;
      rendererRef.current?.splat(nx, ny, 0.3);
    },
    [mergedConfig.interactive],
  );

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!mergedConfig.interactive) return;
      const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width;
      const ny = (e.clientY - rect.top) / rect.height;
      rendererRef.current?.splat(nx, ny, 1.2);
    },
    [mergedConfig.interactive],
  );

  // ---------- 渲染 ----------

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: mergedConfig.interactive ? "auto" : "none",
        opacity: mergedConfig.intensity,
        display: mergedConfig.enabled ? undefined : "none",
      }}
      onPointerMove={handlePointerMove}
      onClick={handleClick}
    />
  );
};

export default FluidBackground;