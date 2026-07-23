# Fluid Background — 设计集成方案

**版本:** 1.0  
**日期:** 2026-07-23  
**作者:** YOU5A  
**状态:** 设计阶段  

---

## 1. 目标

为 Codes Suite 引入独立的流体背景 (Fluid Background)，提升视觉层次感和沉浸式体验。核心要求：

- **独立隔离** — 不污染播放器、歌词、歌曲列表、扫描逻辑、设置系统
- **Light DOM 兼容** — 纯 Canvas 渲染，不使用 Shadow DOM
- **可配置** — 预设、强度、交互模式独立管理
- **性能友好** — 自适应分辨率，支持 `prefers-reduced-motion`

---

## 2. 技术选型

| 方案 | 描述 | 结论 |
|---|---|---|
| CSS `@keyframes` 渐变 | 现有 `GlassBackground` 的 `bg-shimmer` 动画 | ✗ — 表现力不足，不是真流体 |
| Canvas 2D | CPU 端粒子/噪声绘制 | ✗ — 复杂流体计算会阻塞主线程 |
| Three.js ShaderPass | 重量级 3D 库 | ✗ — 引入过多依赖 |
| **原始 WebGL + 自定义 GLSL** | 轻量 GL 上下文，片段着色器模拟 | **✓ 选中** |

选用 WebGL (WebGL1) 实现基于 **Stam 稳定流体** (Stable Fluids) 的实时模拟，使用双 FBO ping-pong 管线完成平流、扩散、投影等阶段。

**不增加新 npm 依赖**。WebGL API 由浏览器/Electron 原生提供。

---

## 3. 目录结构

```
src/
└── components/
    └── FluidBackground/
        ├── index.tsx        # React 组件封装 (挂载/卸载/Props)
        ├── renderer.ts      # WebGL 上下文 & 渲染循环管理
        ├── shaders/
        │   ├── quad.vert    # 全屏四边形顶点着色器
        │   ├── advect.frag  # 平流阶段 — 速度场搬运量
        │   ├── diffuse.frag # 扩散阶段 — 黏性耗散
        │   ├── gradient.frag# 梯度计算 — 求解压力场
        │   ├── subtract.frag# 投影阶段 — 保持不可压缩性
        │   ├── splat.frag   # 染料注入 — 点击/自动扰动
        │   └── display.frag # 最终合成 — 色调映射 & 着色
        ├── presets.ts       # 视觉预设 (Palette/Flow/Turbulence)
        └── config.ts        # 运行时配置 & 本地持久化
```

### 各文件职责

#### `index.tsx` — React 组件

```tsx
export interface FluidBackgroundProps {
  preset?: FluidPreset;          // 预设风格，默认 "aurora"
  intensity?: number;            // 0-1，默认 0.6
  quality?: "low" | "medium" | "high";  // 默认 "medium"
  interactive?: boolean;         // 鼠标交互，默认 true
  className?: string;            // CSS 类名
}
```

- 创建 `<canvas>` 引用
- 管理 `ResizeObserver` 自适应窗口
- 挂载时初始化 `FluidRenderer`，卸载时销毁
- 监听 `prefers-reduced-motion` 自动暂停
- 通过 props 下发配置，**不依赖任何 Context 或全局状态**
- 渲染于 `z-index: 0`，`pointer-events: none`（canvas 自身可接收事件用于 splat）

#### `renderer.ts` — 渲染器

```ts
class FluidRenderer {
  constructor(canvas: HTMLCanvasElement, config: FluidConfig)
  updateConfig(config: Partial<FluidConfig>): void
  setPreset(preset: FluidPreset): void
  splat(x: number, y: number, dx: number, dy: number, color?: [number,number,number]): void
  start(): void
  stop(): void
  destroy(): void
}
```

- 管理 WebGL 上下文 (`webgl` / `experimental-webgl`)
- 创建双 FBO (framebuffer) 用于 ping-pong 模拟
- 每帧执行管线：`splat → advect → diffuse → gradient → subtract → display`
- 自适应分辨率缩放 (基于 `quality` 档位: high=1x, medium=0.5x, low=0.25x)
- 自动处理 WebGL 上下文丢失

#### `shaders/` — GLSL 着色器

基于 Jos Stam 稳定流体算法实现：

| 着色器 | 作用 |
|---|---|
| `quad.vert` | 标准化全屏四边形顶点着色器 |
| `advect.frag` | 沿速度场搬运染料/速度量 |
| `diffuse.frag` | 黏性扩散，求解隐式扩散方程 |
| `gradient.frag` | 计算压力梯度 |
| `subtract.frag` | 梯度减法，投影至无散度场 |
| `splat.frag` | 在指定位置注入染料 & 速度脉冲 |
| `display.frag` | 合成最终画面，色调映射到 CSS 变量色域 |

#### `presets.ts` — 视觉预设

```ts
export type FluidPresetId = "aurora" | "ocean" | "ember" | "nebula" | "plasma" | "forest" | "custom";

export interface FluidPreset {
  id: FluidPresetId;
  name: { zh: string; en: string };
  palette: [number, number, number][];   // RGB 三色组
  flowSpeed: number;                      // 流速 0.1-3.0
  turbulence: number;                     // 湍流 0-1
  dissipation: number;                    // 耗散 0.9-1.0
  densityDissipation: number;             // 染料耗散 0.9-1.0
  autoSplatInterval: number;              // 自动注入间隔 ms (0=关闭)
  backgroundColor: [number, number, number]; // 底色 RGB
}
```

**6 套内置预设：**

| ID | 中文名 | 调性 |
|---|---|---|
| `aurora` | 极光 | 青/紫/品红渐变，低耗散，大尺度流动 |
| `ocean` | 深海 | 蓝/青/白，缓慢暗流 |
| `ember` | 余烬 | 橙/红/金，上升热浪 |
| `nebula` | 星云 | 深紫/粉/蓝，宇宙星云质感 |
| `plasma` | 等离子 | 高对比度 RGB，快速湍流 |
| `forest` | 森林 | 绿/金/棕，温和飘动 |

**主题自动匹配：** 当 `preset="auto"` 时，根据当前主题 (`data-theme-name`) 自动选择：
- `light` / `auto`(亮色) → `aurora`
- `dark` → `nebula`
- `graphite` → `ocean`
- `midnight` → `plasma`
- `ocean` → `ocean`
- `emerald` → `forest`
- `crimson` → `ember`

#### `config.ts` — 配置层

```ts
export interface FluidConfig {
  preset: FluidPresetId | "auto";
  intensity: number;          // 0-1
  quality: "low" | "medium" | "high";
  interactive: boolean;
  enabled: boolean;           // 总开关
}

export const DEFAULT_CONFIG: FluidConfig = {
  preset: "auto",
  intensity: 0.6,
  quality: "medium",
  interactive: true,
  enabled: true,
};
```

- 配置独立持久化到 `localStorage` key `fluid-background-config`
- 不与 `AppSettings` / `useTheme.settings` 耦合
- 导出 `loadConfig()` / `saveConfig()` 纯函数

---

## 4. 集成方案

### 4.1 在 GlassLayout 中替换背景层

**修改文件:** `src/design-system/layouts/GlassLayout.tsx`

```tsx
// 现有:
<GlassBackground {...background} />

// 改为:
<FluidBackground preset="auto" intensity={0.6} />
{/* 或者同时保留两者：FluidBackground 在下，GlassBackground 在上作叠加 */}
```

**原则：** 最小侵入。只改 GlassLayout 一行，不影响 GlassBackground 组件的独立性。

### 4.2 背景层 z-index 规范

```
z-index  层
───────────────────────
0        FluidBackground (Canvas)     ← 新增
1        GlassBackground (CSS 渐变)   ← 保留作为叠加
10-20    页面内容 (Sidebar/GlassMain)
30       TitleBar
100+     Modal/Toast
```

FluidBackground 的 Canvas 设为 `position: fixed; inset: 0; z-index: 0;`，不参与布局流。

### 4.3 不污染清单

| 模块 | 防护措施 |
|---|---|
| **播放器** | FluidBackground 不读取/不写入播放状态、不监听播放事件 |
| **歌词** | 无 Lyrics 组件接触；canvas 在 z=0，不阻挡交互 |
| **歌曲列表** | 无扫描逻辑关联；`pointer-events: none` 确保列表可点击 |
| **扫描逻辑** | 无 Python bridge 调用；纯前端 WebGL 渲染 |
| **设置系统** | 使用独立的 `localStorage` key `fluid-background-config`；不扩展 `AppSettings` 类型 |
| **Sidebar** | z-index 10 > FluidBackground z-index 0，不受影响 |
| **Toast/Modal** | z-index 100+，完全覆盖 |

---

## 5. 性能策略

| 策略 | 实现 |
|---|---|
| 自适应分辨率 | `quality` 控制：high=1x, medium=0.5x, low=0.25x 视口分辨率 |
| Delta Time 节流 | 固定模拟步长 (16ms)，渲染与模拟解耦 |
| `prefers-reduced-motion` | 检测到后自动停止渲染循环 |
| 页面不可见 | `document.hidden` 时暂停 requestAnimationFrame |
| WebGL 上下文丢失 | 自动重建 + 恢复 |
| 内存 | 仅 2 个浮点纹理 FBO，组件卸载时 `deleteTexture` + `loseContext` |

---

## 6. 实施步骤

| 步骤 | 内容 | 文件 |
|---|---|---|
| **Step 1** | 创建目录 `src/components/FluidBackground/` | 新建 |
| **Step 2** | 编写 GLSL 着色器 (7 个文件) | `shaders/*.glsl` |
| **Step 3** | 实现 `renderer.ts` (WebGL 上下文, FBO, 管线) | `renderer.ts` |
| **Step 4** | 实现 `presets.ts` (6 套预设 + 自动匹配) | `presets.ts` |
| **Step 5** | 实现 `config.ts` (配置持久化) | `config.ts` |
| **Step 6** | 实现 `index.tsx` (React 组件封装) | `index.tsx` |
| **Step 7** | 集成到 `GlassLayout` (替换/叠加背景) | `GlassLayout.tsx` |
| **Step 8** | 添加设置页面 Fluid 配置项 | `Settings.tsx` |
| **Step 9** | 测试: 播放器不受影响 / 列表可操作 / 主题切换 | 手动 |

---

## 7. 风险 & 缓解

| 风险 | 缓解 |
|---|---|
| WebGL 在老 GPU 上不可用 | 自动降级到现有 `GlassBackground` (CSS 渐变) |
| Electron offscreen 截图遗漏 Canvas | 截图前临时绘制一帧到 Canvas |
| 与现有 `bg-shimmer` 动画冲突 | Fluid 启用时自动禁用 `glass-background-animated` 类名 |
| 性能衰退 | `quality: "low"` 档位, 自动检测 FPS 低于 30 降级 |

---

## 8. 参考

- Stam, J. (1999). *Stable Fluids*. SIGGRAPH.
- [WebGL Fluid Simulation](https://github.com/PavelDoGreat/WebGL-Fluid-Simulation) — 参考实现
- [GPU Gems Chapter 38](https://developer.nvidia.com/gpugems/gpugems/part-vi-beyond-triangles/chapter-38-fast-fluid-dynamics-simulation-gpu) — GPU 流体动力学
- 现有 `GlassBackground` 组件 — `src/design-system/layouts/GlassBackground.tsx`
- CSS 动画系统 — `src/styles/globals.css` (bg-shimmer)
