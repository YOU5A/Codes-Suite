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
  /** ????, ?? "auto" (????) */
  preset?: FluidPresetId | "auto";
  /** ???? 0-1, ?? 0.6 */
  intensity?: number;
  /** ????, ?? "medium" */
  quality?: "low" | "medium" | "high";
  /** ????????, ?? true */
  interactive?: boolean;
  /** ????, ?? true */
  enabled?: boolean;
  /** ???? 0.1-3.0, ?? 1.0 */
  speedMultiplier?: number;
  /** ???? 0-1, ?? 0 */
  blurAmount?: number;
  /** ????, ?? "auto" */
  colorMode?: "auto" | "cover" | "dynamic";
  /** ????? RGB, ?? colorMode="cover" */
  coverColor?: [number, number, number] | null;
  /** ?????? (30/60), ?? 60 */
  targetFps?: number;
  /** ?? CSS ?? */
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

    // 启动
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

  // ---------- Props 变更 ----------

  useEffect(() => {
    rendererRef.current?.updateConfig({
      preset,
      intensity,
      quality,
      interactive,
      enabled,
      speedMultiplier,
      blurAmount,
      colorMode,
    });
  }, [preset, intensity, quality, interactive, enabled, speedMultiplier, blurAmount, colorMode]);

  // ??????
  useEffect(() => {
    rendererRef.current?.setCoverColor(coverColor ?? null);
  }, [coverColor]);

  // FPS ??
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
        filter: mergedConfig.blurAmount > 0 ? `blur(${mergedConfig.blurAmount * 20}px)` : "none",
      }}
      onPointerMove={handlePointerMove}
      onClick={handleClick}
    />
  );
};

export default FluidBackground;
