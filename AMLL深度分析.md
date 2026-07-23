# AMLL Core 深度分析 — 可复用指南

> 分析日期: 2026-07-23
> 源仓库: https://github.com/amll-dev/applemusic-like-lyrics
> 文档: https://amll.dev/guides/component/background
> 源许可证: AGPL 3.0 | Codes-Suite 许可证: AGPL 3.0 ✅ 兼容
> 当前版本: 0.5.2

---

## 1. 许可确认

`
源项目: GNU AGPL 3.0
Codes-Suite: AGPL 3.0 (package.json 已更新)
→ 许可证兼容，可直接复用源文件。
`

**使用规则:**
- ✅ 可复制粘贴任何源文件到 src/ 下，保留原始版权注释
- ✅ 可修改、裁剪、内联 GLSL shader 字符串
- ✅ 可基于 MeshGradientRenderer 派生自己的渲染器
- ⚠️ 衍生文件也须保持 AGPL 3.0

---

## 2. 架构总览 (可直接复刻)

### 分层设计

`
React Binding (bg-render.tsx)      ← 复制到 src/components/FluidBackground.tsx
    │
BackgroundRender<T>                 ← 复制到 src/design-system/fluid/renderer.ts
    │
BaseRenderer                        ← 复制到 src/design-system/fluid/base.ts
    │
MeshGradientRenderer (WebGL)       ← ★ 复制到 src/design-system/fluid/mesh.ts
    ├── mesh.vert.glsl / mesh.frag.glsl → 复制或内联
    ├── cp-generate.ts              → 复制到 src/design-system/fluid/cp-generate.ts
    └── cp-presets.ts               → 复制到 src/design-system/fluid/cp-presets.ts
`

### 关键设计模式

| 模式 | 用途 |
|------|------|
| **Facade** | BackgroundRender 包装底层 Renderer，对外暴露 setAlbum/setFPS/pause 等 |
| **Template Method** | BaseRenderer 定义 ResizeObserver + 抽象方法，子类只需实现渲染逻辑 |
| **Strategy** | 运行时切换 MeshGradient ↔ 自定义渲染器 |
| **Observer** | ResizeObserver 监听容器尺寸，自动调 canvas 分辨率 |
| **State Machine** | paused / staticMode / _disposed 三态管理，防止内存泄漏 |

---

## 3. 可直接复制的核心模块

### 3.1 渲染器基类 → src/design-system/fluid/base.ts

源文件: packages/core/src/bg-render/base.ts

`	ypescript
// 仅需修改 import 路径，其余可直接使用
import type { Disposable, HasElement } from "../interfaces.ts"; // 改为本地接口

export abstract class AbstractBaseRenderer implements Disposable, HasElement {
  abstract setFlowSpeed(speed: number): void;
  abstract setRenderScale(scale: number): void;
  abstract setStaticMode(enable: boolean): void;
  abstract setFPS(fps: number): void;
  abstract pause(): void;
  abstract resume(): void;
  abstract setAlbum(source: string | HTMLImageElement, isVideo?: boolean): Promise<void>;
  abstract setLowFreqVolume(volume: number): void;
  abstract setHasLyric(hasLyric: boolean): void;
  abstract dispose(): void;
  abstract getElement(): HTMLElement;
}

export abstract class BaseRenderer extends AbstractBaseRenderer {
  private observer: ResizeObserver;
  protected flowSpeed = 1;
  protected currentRenderScale = 0.75;

  constructor(protected canvas: HTMLCanvasElement) {
    super();
    this.observer = new ResizeObserver(() => {
      const width = Math.max(1, canvas.clientWidth * devicePixelRatio * this.currentRenderScale);
      const height = Math.max(1, canvas.clientHeight * devicePixelRatio * this.currentRenderScale);
      this.onResize(width, height);
    });
    this.observer.observe(canvas);
  }

  setRenderScale(scale: number): void {
    this.currentRenderScale = scale;
    // 触发一次 resize
    this.onResize(
      this.canvas.clientWidth * devicePixelRatio * this.currentRenderScale,
      this.canvas.clientHeight * devicePixelRatio * this.currentRenderScale,
    );
  }

  setFlowSpeed(speed: number): void { this.flowSpeed = speed; }

  protected onResize(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;
  }

  dispose(): void {
    this.observer.disconnect();
    this.canvas.remove();
  }

  getElement(): HTMLElement { return this.canvas; }
}
`

### 3.2 Facade 包装器 → src/design-system/fluid/renderer.ts

源文件: packages/core/src/bg-render/index.ts

`	ypescript
// ★ 核心: 统一的外部 API 层，内部委托给具体 Renderer
export class FluidBackground<T extends BaseRenderer> implements AbstractBaseRenderer {
  private element: HTMLCanvasElement;
  private renderer: T;

  constructor(renderer: T, canvas: HTMLCanvasElement) {
    this.renderer = renderer;
    this.element = canvas;
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "0";
    canvas.style.position = "absolute";
    canvas.style.inset = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
  }

  static new<T extends BaseRenderer>(type: { new(c: HTMLCanvasElement): T }): FluidBackground<T> {
    return new FluidBackground(new type(document.createElement("canvas")), document.createElement("canvas"));
  }

  setRenderScale(scale: number): void { this.renderer.setRenderScale(scale); }
  setFlowSpeed(speed: number): void { this.renderer.setFlowSpeed(speed); }
  setStaticMode(en: boolean): void { this.renderer.setStaticMode(en); }
  setFPS(fps: number): void { this.renderer.setFPS(fps); }
  pause(): void { this.renderer.pause(); }
  resume(): void { this.renderer.resume(); }
  setLowFreqVolume(v: number): void { this.renderer.setLowFreqVolume(v); }
  setHasLyric(h: boolean): void { this.renderer.setHasLyric(h); }
  setAlbum(src: string | HTMLImageElement, isVideo?: boolean): Promise<void> {
    return this.renderer.setAlbum(src, isVideo);
  }
  getElement(): HTMLCanvasElement { return this.element; }
  dispose(): void { this.renderer.dispose(); this.element.remove(); }
}
`

### 3.3 GLSL Shader → 内联字符串

源文件: mesh.frag.glsl + mesh.vert.glsl

`	ypescript
// 可直接作为模板字符串内联到 mesh.ts 中
// 无需单独的 .glsl 文件 — Vite 默认支持 ?raw import 但内联更简单

const MESH_VERT = /*glsl*/
precision mediump float;
attribute vec2 a_pos;
attribute vec3 a_color;
attribute vec2 a_uv;
varying vec3 v_color;
varying vec2 v_uv;
uniform float u_aspect;

void main() {
    v_color = a_color;
    v_uv = a_uv;
    vec2 pos = a_pos;
    if (u_aspect > 1.0) pos.y *= u_aspect;
    else pos.x /= u_aspect;
    gl_Position = vec4(pos, 0.0, 1.0);
};

const MESH_FRAG = /*glsl*/
precision mediump float;
varying vec3 v_color;
varying vec2 v_uv;
uniform sampler2D u_texture;
uniform float u_volume;
uniform float u_alpha;
uniform float u_sinAngle;
uniform float u_cosAngle;

const float INV_255 = 1.0 / 255.0;
const float HALF_INV_255 = 0.5 / 255.0;
const float GRADIENT_NOISE_A = 52.9829189;
const vec2 GRADIENT_NOISE_B = vec2(0.06711056, 0.00583715);

float gradientNoise(in vec2 uv) {
    return fract(GRADIENT_NOISE_A * fract(dot(uv, GRADIENT_NOISE_B)));
}

void main() {
    float volumeEffect = u_volume * 2.0;
    float dither = INV_255 * gradientNoise(gl_FragCoord.xy) - HALF_INV_255;
    vec2 centeredUV = v_uv - vec2(0.2);
    vec2 rotatedUV = vec2(
        u_cosAngle * centeredUV.x - u_sinAngle * centeredUV.y,
        u_sinAngle * centeredUV.x + u_cosAngle * centeredUV.y
    );
    vec2 finalUV = rotatedUV * max(0.001, 1.0 - volumeEffect) + vec2(0.5);
    vec4 result = texture2D(u_texture, finalUV);
    float alphaFactor = u_alpha * max(0.5, 1.0 - u_volume * 0.5);
    result.rgb *= v_color * alphaFactor;
    result.a *= alphaFactor;
    result.rgb += vec3(dither);
    float dist = distance(v_uv, vec2(0.5));
    float vignette = smoothstep(0.8, 0.3, dist);
    result.rgb *= 0.6 + vignette * 0.4;
    gl_FragColor = result;
};
`

### 3.4 控制点生成 → src/design-system/fluid/cp-generate.ts

源文件: cp-generate.ts + cp-presets.ts

**可直接复制整文件**，只需调整 import 路径。核心算法：

`	ypescript
// 1. 生成 N×M 网格控制点（Perlin 噪声 + 随机扰动 + 高斯平滑）
export function generateControlPoints(
  width: number,    // 网格列数 (3-6)
  height: number,   // 网格行数 (3-6)
): ControlPointPreset {
  const conf: ControlPointConf[] = [];
  for (let j = 0; j < h; j++) {
    for (let i = 0; i < w; i++) {
      // 基础位置: 均匀网格 (-1 到 1)
      const baseX = (i / (w - 1)) * 2 - 1;
      const baseY = (j / (h - 1)) * 2 - 1;
      // 非边界点加 Perlin 噪声梯度偏移
      // 非边界点加随机扰动
      // uv 旋转/缩放参数
      conf.push({ cx: i, cy: j, x, y, ur, vr, up, vp });
    }
  }
  // 3×3 高斯核平滑 3-5 轮
  smoothifyControlPoints(conf, w, h);
  return preset(w, h, conf);
}
`

### 3.5 React 绑定 → src/components/FluidBackground.tsx

源文件: packages/react/src/bg-render.tsx

`	sx
// ★ 可直接复制，改为本地 import 路径
import { useRef, useEffect, useImperativeHandle, forwardRef } from "react";
import { FluidBackground, MeshGradientRenderer } from "@/design-system/fluid";

export interface FluidBackgroundProps {
  album?: string;           // 封面 URL 或 base64 data: URI
  playing?: boolean;        // 播放状态
  fps?: number;             // 默认 30
  flowSpeed?: number;       // 默认 1
  renderScale?: number;     // 默认 0.75
  staticMode?: boolean;     // 默认 false
  lowFreqVolume?: number;   // [0-1]
}

export const FluidBg = forwardRef<any, FluidBackgroundProps & { style?: React.CSSProperties }>(
  ({ album, playing, fps, flowSpeed, renderScale, staticMode, lowFreqVolume, style, ...rest }, ref) => {
    const bgRef = useRef<FluidBackground<MeshGradientRenderer>>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // 初始化
    useEffect(() => {
      bgRef.current = FluidBackground.new(MeshGradientRenderer);
      const el = bgRef.current.getElement();
      el.style.width = "100%";
      el.style.height = "100%";
      wrapperRef.current?.appendChild(el);
      return () => { bgRef.current?.dispose(); };
    }, []);

    // Props → API
    useEffect(() => { if (album) bgRef.current?.setAlbum(album); }, [album]);
    useEffect(() => { if (fps != null) bgRef.current?.setFPS(fps); }, [fps]);
    useEffect(() => { bgRef.current?.setStaticMode(staticMode ?? false); }, [staticMode]);
    useEffect(() => {
      if (playing === undefined) bgRef.current?.resume();
      else if (playing) bgRef.current?.resume();
      else bgRef.current?.pause();
    }, [playing]);
    useEffect(() => { if (flowSpeed != null) bgRef.current?.setFlowSpeed(flowSpeed); }, [flowSpeed]);
    useEffect(() => { if (renderScale != null) bgRef.current?.setRenderScale(renderScale); }, [renderScale]);
    useEffect(() => { if (lowFreqVolume != null) bgRef.current?.setLowFreqVolume(lowFreqVolume); }, [lowFreqVolume]);

    useImperativeHandle(ref, () => ({ bgRender: bgRef.current, wrapperEl: wrapperRef.current }));

    return <div ref={wrapperRef} style={{ position: "absolute", inset: 0, overflow: "hidden", ...style }} {...rest} />;
  }
);
`

---

## 4. 动画循环 (核心代码)

源文件: mesh-renderer/index.ts 的 onTick 方法

`	ypescript
// ★ 帧率漂移修正 + staticMode 自动休眠
private onTick(tickTime: number) {
  if (this.paused || this._disposed) return;

  const interval = 1000 / this.maxFPS;
  const delta = tickTime - this.lastTickTime;
  if (delta < interval) { this.requestTick(); return; }

  const frameDelta = tickTime - this.lastFrameTime;
  this.lastFrameTime = tickTime;
  this.lastTickTime = tickTime - (delta % interval);  // 关键: 防止帧率漂移

  this.frameTime += frameDelta * this.flowSpeed;

  if (!(this.onRedraw(this.frameTime, frameDelta) && this.staticMode)) {
    this.requestTick();  // 继续循环
  }
}

// onRedraw 返回 true 表示"动画已完成，可以静默"
// staticMode=true 时 → 停止 rAF
`

---

## 5. 性能优化清单 (可直接照搬)

| 优化项 | 代码位置 | 效果 |
|--------|----------|------|
| 帧率漂移修正 | lastTickTime = tickTime - (delta % interval) | 高刷屏降帧不抖动 |
| staticMode 休眠 | if (staticMode && done) return; (不调用 rAF) | 闲置 CPU 0% |
| renderScale 分级 | setRenderScale(0.5) | 低端降低 GPU 负载 |
| FBO 复用 | updateFBO() 仅尺寸变化时重建 | 避免每帧分配纹理 |
| vertex buffer DYNAMIC_DRAW | gl.bufferData(..., gl.DYNAMIC_DRAW) | 每帧更新顶点零分配 |
| ResizeObserver | 原生 API，非轮询 | 零开销尺寸监听 |
| dither 防色带 | mesh.frag.glsl: gradientNoise | GPU 端几乎零开销 |
| StackBlur 自实现 | img.ts: blurImage() | 比 CSS blur 更快，离线处理 |

---

## 6. 集成到 Codes-Suite

### 文件放置方案

`
src/design-system/fluid/
├── index.ts          # 统一导出
├── base.ts           # AbstractBaseRenderer + BaseRenderer
├── renderer.ts       # FluidBackground facade
├── mesh.ts           # MeshGradientRenderer (WebGL)
├── shaders.ts        # GLSL 内联字符串
├── cp-generate.ts    # 控制点生成算法
├── cp-presets.ts     # 控制点预设数据集
├── img.ts            # blurImage / saturateImage / contrastImage
└── utils.ts          # Vec2/Vec3 等工具类型 (可用 gl-matrix 或自实现)

src/components/
└── FluidBackground.tsx  # React 绑定组件
`

### 使用示例

`	sx
// src/pages/MusicManager.tsx 中添加
import { FluidBg } from "@/components/FluidBackground";

// 在 JSX 中 (GlassBackground 同级或替换)
<FluidBg
  album={coverB64 ? data:image/jpeg;base64, : undefined}
  playing={playback.is_playing}
  fps={settings.animationSpeed === "fast" ? 30 : 20}
  flowSpeed={settings.animationSpeed === "off" ? 0 : 0.5}
  renderScale={0.5}
  staticMode={settings.animationSpeed === "off"}
  lowFreqVolume={volume / 100}
  style={{ position: "fixed", inset: 0, zIndex: 0 }}
/>
`

### 与现有背景共存

`
GlassLayout
  ├── GlassBackground       ← 保留作为 fallback (无封面时)
  └── FluidBg               ← 新增 (有封面时)，z-index 高于 GlassBackground
`

---

## 7. 可直接复制的文件清单

| 源文件 (AMLL) | 目标位置 (Codes-Suite) | 修改量 |
|---------------|----------------------|--------|
| g-render/base.ts | design-system/fluid/base.ts | 仅 import 路径 |
| g-render/index.ts | design-system/fluid/renderer.ts | 仅 import 路径 |
| mesh-renderer/index.ts | design-system/fluid/mesh.ts | import 路径 + 移除 Pixi 无关代码 |
| mesh-renderer/cp-generate.ts | design-system/fluid/cp-generate.ts | 仅 import 路径 |
| mesh-renderer/cp-presets.ts | design-system/fluid/cp-presets.ts | 仅 import 路径 |
| mesh.frag.glsl | 内联到 shaders.ts | 零改动 |
| mesh.vert.glsl | 内联到 shaders.ts | 零改动 |
| img.ts | design-system/fluid/img.ts | 仅 import 路径 |
| eact/bg-render.tsx | components/FluidBackground.tsx | import 路径 + 对接 Codes-Suite 类型 |

**总计: ~2000 行可直接复用，预计 2-3 小时完成集成。**
