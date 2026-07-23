/**
 * FluidBackground Canvas 2D 渲染引擎
 * 基于多彩光斑流动：径向渐变圆 + alpha 混合
 * 灵感参考 AMLL MeshGradientRenderer, 简化实现
 */

import type { FluidConfig, FluidPresetId } from "./config";
import { PRESETS, resolveAutoPreset, type FluidPreset } from "./presets";
import { generateCoverPalette } from "@/utils/colorExtractor";

// ---------- 类型 ----------

interface Blob {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  color: [number, number, number];
  radius: number;
  opacity: number;
}

interface QualitySettings {
  resolutionScale: number;
  blurPasses: number;
}

const QUALITY: Record<string, QualitySettings> = {
  low:    { resolutionScale: 0.25, blurPasses: 1 },
  medium: { resolutionScale: 0.5,  blurPasses: 2 },
  high:   { resolutionScale: 0.75, blurPasses: 3 },
};

// ---------- 工具函数 ----------

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function rand(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** 简易 smooth noise (基于正弦哈希) */
function smoothNoise(x: number, y: number, t: number): number {
  const a = Math.sin(x * 3.7 + t * 0.3) * Math.cos(y * 4.1 + t * 0.4);
  const b = Math.sin((x + y) * 2.3 + t * 0.5) * Math.cos(x * 5.7 - t * 0.35);
  return (a + b) * 0.5;
}

// ---------- FluidRenderer ----------

export class FluidRenderer {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private offCanvas: HTMLCanvasElement | null = null;
  private offCtx: CanvasRenderingContext2D | null = null;

  private blobs: Blob[] = [];
  private animFrameId = 0;
  private running = false;
  private visible = true;

  private config: FluidConfig;
  private currentPreset: FluidPreset;
  private coverColor: [number, number, number] | null = null;
  private coverPalette: { colors: [number, number, number][]; background: [number, number, number] } | null = null;

  private lastTime = 0;
  private elapsedSinceDrift = 0;
  private globalTime = 0;

  private width = 0;
  private height = 0;

  private reducedMotion = false;
  private motionMediaQuery?: MediaQueryList;

  // FPS limiting
  private targetFps = 60;
  private frameInterval = 1000 / 60;
  private lastFrameTimestamp = 0;

  // ---------- 构造与生命周期 ----------

  constructor(canvas: HTMLCanvasElement, config: FluidConfig) {
    this.canvas = canvas;
    this.config = { ...config };
    this.currentPreset = this.resolvePreset(config.preset);
    this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.initContext();
    this.spawnBlobs();
    this.setupMotionListener();
  }

  private initContext(): void {
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext("2d", { alpha: true });
    this.offCanvas = document.createElement("canvas");
    this.offCtx = this.offCanvas.getContext("2d", { alpha: true });
  }

  private setupMotionListener(): void {
    this.motionMediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => {
      this.reducedMotion = e.matches;
      if (e.matches) {
        this.stop();
      } else if (this.running === false && this.visible) {
        this.start();
      }
    };
    this.motionMediaQuery.addEventListener("change", handler);
  }

  // ---------- 预设解析 ----------

  private resolvePreset(presetId: FluidPresetId | "auto"): FluidPreset {
    if (presetId === "auto") {
      const themeName = document.documentElement.dataset.themeName;
      return PRESETS[resolveAutoPreset(themeName)] ?? PRESETS.aurora;
    }
    return PRESETS[presetId] ?? PRESETS.aurora;
  }

  // ---------- 光斑生成 ----------

  private spawnBlobs(): void {
    const p = this.currentPreset;
    const count = p.blobCount;
    this.blobs = [];

    for (let i = 0; i < count; i++) {
      this.blobs.push({
        x: Math.random(),
        y: Math.random(),
        targetX: Math.random(),
        targetY: Math.random(),
        color: pick(p.palette.colors),
        radius: rand(p.blobRadius[0], p.blobRadius[1]),
        opacity: rand(p.blobOpacity[0], p.blobOpacity[1]),
      });
    }
  }

  // ---------- 配置更新 ----------

  updateConfig(config: Partial<FluidConfig>): void {
    const prevPreset = this.config.preset;
    const prevColorMode = this.config.colorMode;
    Object.assign(this.config, config);

    if (config.preset !== undefined && config.preset !== prevPreset) {
      this.currentPreset = this.resolvePreset(config.preset);
      this.spawnBlobs();
    }
    // Switch to/from cover mode: reassign blob colors
    if (config.colorMode !== undefined && config.colorMode !== prevColorMode) {
      if (config.colorMode === "cover" && this.coverPalette) {
        // Apply cover palette to existing blobs
        const paletteColors = this.coverPalette.colors;
        for (let i = 0; i < this.blobs.length; i++) {
          this.blobs[i].color = paletteColors[i % paletteColors.length];
        }
      } else if (prevColorMode === "cover" && config.colorMode !== "cover") {
        // Restore preset colors
        this.spawnBlobs();
      }
    }
    if (config.intensity !== undefined) {
      this.canvas!.style.opacity = String(config.intensity);
    }
  }

  setPreset(presetId: FluidPresetId | "auto"): void {
    this.updateConfig({ preset: presetId });
  }

  // ---------- 鼠标交互 ----------

  /** 在指定位置注入光斑扰动 */
  splat(nx: number, ny: number, force = 1.0): void {
    if (!this.config.interactive) return;
    // 随机扰动附近光斑的 target
    for (const blob of this.blobs) {
      const dx = blob.x - nx;
      const dy = blob.y - ny;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 0.25) {
        const strength = (1 - dist / 0.25) * force;
        blob.targetX += (blob.targetX - nx) * strength * 0.5;
        blob.targetY += (blob.targetY - ny) * strength * 0.5;
        blob.targetX = Math.max(0, Math.min(1, blob.targetX));
        blob.targetY = Math.max(0, Math.min(1, blob.targetY));
      }
    }
  }

  // ---------- 封面颜色 ----------

  /** Set cover dominant color for colorMode="cover" */
  setCoverColor(color: [number, number, number] | null): void {
    this.coverColor = color;
    if (color) {
      this.coverPalette = generateCoverPalette(color);
      // Reassign blob colors from cover palette (only when color changes, not every frame)
      if (this.config.colorMode === "cover" && this.blobs.length > 0) {
        const paletteColors = this.coverPalette.colors;
        for (let i = 0; i < this.blobs.length; i++) {
          this.blobs[i].color = paletteColors[i % paletteColors.length];
        }
      }
    } else {
      this.coverPalette = null;
      // Restore preset colors when cover is removed
      if (this.config.colorMode === "cover") {
        this.spawnBlobs();
      }
    }
  }

  // ---------- 动画控制 ----------

  start(): void {
    if (this.running || this.reducedMotion) return;
    this.running = true;
    this.lastTime = performance.now();
    this.lastFrameTimestamp = this.lastTime;
    this.loop(this.lastTime);
  }

  stop(): void {
    this.running = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = 0;
    }
  }

  destroy(): void {
    this.stop();
    this.motionMediaQuery?.removeEventListener("change", () => {});
    this.canvas = null;
    this.ctx = null;
    this.offCanvas = null;
    this.offCtx = null;
  }

  setVisible(v: boolean): void {
    this.visible = v;
    if (v && !this.running && !this.reducedMotion) {
      this.start();
    } else if (!v) {
      this.stop();
    }
  }

  /** Set target FPS for frame rate limiting */
  setTargetFps(fps: number): void {
    this.targetFps = Math.max(15, Math.min(120, fps));
    this.frameInterval = 1000 / this.targetFps;
  }

  // ---------- 主循环 ----------

  private loop = (timestamp: number): void => {
    if (!this.running) return;

    // FPS limiting: skip frames that arrive before the interval
    const frameElapsed = timestamp - this.lastFrameTimestamp;
    if (frameElapsed < this.frameInterval) {
      this.animFrameId = requestAnimationFrame(this.loop);
      return;
    }
    this.lastFrameTimestamp = timestamp;

    const dt = Math.min(timestamp - this.lastTime, 50);
    this.lastTime = timestamp;
    this.globalTime += dt;

    if (dt > 0) {
      this.updateBlobs(dt);
      this.render();
    }

    this.animFrameId = requestAnimationFrame(this.loop);
  };

  // ---------- 光斑运动 ----------

  private updateBlobs(dt: number): void {
    const p = this.currentPreset;
    const speed = p.flowSpeed * this.config.speedMultiplier * (dt / 1000);
    this.elapsedSinceDrift += dt;

    // 定期更新目标位置
    if (this.elapsedSinceDrift >= p.driftInterval) {
      this.elapsedSinceDrift = 0;
      for (const blob of this.blobs) {
        blob.targetX = Math.max(0.05, Math.min(0.95, blob.targetX + rand(-p.jitter, p.jitter)));
        blob.targetY = Math.max(0.05, Math.min(0.95, blob.targetY + rand(-p.jitter, p.jitter)));
      }
    }

    // 移动光斑
    for (const blob of this.blobs) {
      const noiseVal = smoothNoise(blob.x, blob.y, this.globalTime * 0.001) * 0.3;
      blob.x = lerp(blob.x, blob.targetX + noiseVal, speed * 0.8);
      blob.y = lerp(blob.y, blob.targetY + noiseVal, speed * 0.8);
    }
  }

  // ---------- 渲染 ----------

  private render(): void {
    const canvas = this.canvas!;
    const ctx = this.ctx!;
    const offCanvas = this.offCanvas!;
    const offCtx = this.offCtx!;

    const w = canvas.width;
    const h = canvas.height;

    if (w === 0 || h === 0) return;

    // 计算离屏分辨率
    const qs = QUALITY[this.config.quality] ?? QUALITY.medium;
    const offW = Math.max(64, Math.floor(w * qs.resolutionScale));
    const offH = Math.max(64, Math.floor(h * qs.resolutionScale));

    if (offCanvas.width !== offW || offCanvas.height !== offH) {
      offCanvas.width = offW;
      offCanvas.height = offH;
    }

    // 1. 清空离屏画布
    offCtx.clearRect(0, 0, offW, offH);

    // 2. 填充背景底色
    // Use cover palette when in cover mode, otherwise use preset palette
    const palette = (this.config.colorMode === "cover" && this.coverPalette)
      ? this.coverPalette
      : this.currentPreset.palette;
    const bg = palette.background;
    offCtx.fillStyle = `rgb(${bg[0]},${bg[1]},${bg[2]})`;
    offCtx.fillRect(0, 0, offW, offH);

    // 3. 绘制光斑
    for (const blob of this.blobs) {
      const cx = blob.x * offW;
      const cy = blob.y * offH;
      const r = blob.radius * Math.min(offW, offH);
      const [cr, cg, cb] = blob.color;
      const alpha = blob.opacity * this.config.intensity;

      const grad = offCtx.createRadialGradient(cx, cy, 0, cx, cy, r);
      grad.addColorStop(0, `rgba(${cr},${cg},${cb},${alpha})`);
      grad.addColorStop(0.5, `rgba(${cr},${cg},${cb},${alpha * 0.4})`);
      grad.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);

      offCtx.fillStyle = grad;
      offCtx.fillRect(cx - r, cy - r, r * 2, r * 2);
    }

    // 4. 将离屏画布回绘到主画布（浏览器自动双线性插值放大，形成柔和过渡）
    ctx.clearRect(0, 0, w, h);

    // 应用模糊效果
    if (this.config.blurAmount > 0) {
      ctx.filter = `blur(${this.config.blurAmount * 20}px)`;
    } else {
      ctx.filter = "none";
    }

    ctx.drawImage(offCanvas, 0, 0, w, h);
    ctx.filter = "none";
  }

  // ---------- 尺寸自适应 ----------

  resize(width: number, height: number): void {
    if (!this.canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const qs = QUALITY[this.config.quality] ?? QUALITY.medium;
    const scale = dpr * qs.resolutionScale;
    this.canvas.width = Math.floor(width * scale);
    this.canvas.height = Math.floor(height * scale);
    this.canvas.style.width = width + "px";
    this.canvas.style.height = height + "px";
    this.width = width;
    this.height = height;
  }
}
