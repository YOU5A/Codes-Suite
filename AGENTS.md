# AGENTS.md — Codes Suite

**项目名称:** Codes Suite
**作者:** YOU5A
**技术栈:** TypeScript 6 · React 19 · Tailwind CSS 4 · Framer Motion 12 · Electron 42 · Python 3.13
**语言:** TypeScript / Python (英文标识符，中文注释与 UI 文字)
**仓库:** https://github.com/YOU5A/Codes-Suite
**版本:** 1.3.0

---

## 🛑 绝对保护规则

### 编码行为准则（Karpathy Guidelines）

1. **先思考再编码** — 明确假设，不隐藏困惑。有疑问先问。
2. **简洁优先** — 只写解决问题所需的最少代码。不过度抽象、不添加未要求的功能。
3. **精准修改** — 只改需要改的。不顺手"优化"无关代码、不重构未损坏的部分。匹配现有代码风格。
4. **目标驱动** — 以可验证的成功标准定义任务，循环直到验证通过。

### Liquid Glass 迁移规则

- **不修改:** 业务逻辑、API、路由、状态管理。
- **只修改:** UI、组件、样式、动画。
- **所有 UI 必须使用 `src/design-system`**，禁止在页面内创建零散样式。
- **执行流程:** 先检查现有代码 → 理解架构 → 解释方案。禁止盲目重写。
- **分阶段严格推进:** 每个阶段完成后 STOP，报告变更文件、新建组件、问题、构建结果、下一步。

### Light DOM 渲染策略（兼容 Electron offscreen）

- **全量使用 Light DOM**（不使用 Shadow DOM），确保 Electron offscreen 截图可见内容。
- 禁止 Web Component custom element（自动 Shadow DOM）。
- 使用常规 HTML 元素 + CSS 类名 + data 属性。
- 样式直接通过 CSS 文件引入，不依赖 Shadow DOM 隔离。

### 通用规则

- 对话与注释初始语言为中文。
- 所有文本文件使用 UTF-8 without BOM 编码。
- 修改文件时保持原文件编码，不额外添加 BOM。
- Python 读取文件时使用 `encoding='utf-8'` 或 `encoding='utf-8-sig'`。
- 没有 git 指令时不要私自使用 git。
- **禁止批量删除文件或目录**（`rm -rf`、`Remove-Item -Recurse` 等）。

---

## 项目概述

Codes Suite 是 Windows 系统调优一体化工具箱，融合 Apple Liquid Glass 设计语言与 Framer Motion 动效引擎，提供六项核心功能：

| 模块 | 功能 |
|---|---|
| Win32 优先级分离 | 读写 `Win32PrioritySeparation` 注册表键值，内置预设方案与备份管理 |
| 应用 CPU 优先级 | IFEO 注册表级规则 CRUD，支持 JSON 导入/导出 |
| 音乐管理器 | MP3/FLAC/OGG/M4A 标签编辑、封面提取、内置播放器 |
| 备份中心 | 注册表备份快照管理：查看、恢复、导出、清理 |
| 系统仪表盘 | CPU/内存/磁盘/系统信息实时轮询 + 操作历史 |
| 深度定制 | 8 套主题、窗口透明度、圆角、动画速度、紧凑模式、字体缩放 |

---

## 项目结构

```
Codes-Suite/
├── bridge/                  # Python JSON-RPC 服务端
│   ├── config.json          # Bridge 配置
│   └── server.py            # Python Bridge 入口
├── build-support/           # 嵌入式 Python venv 构建支持 (gitignored)
├── data/                    # 用户数据目录
├── docs/                    # 设计文档与迁移报告
│   ├── final-report.md
│   ├── layout-report.md
│   ├── liquid-glass-audit.md
│   ├── liquid-glass-plan.md
│   ├── page-migration-order.md
│   └── performance-report.md
├── electron/                # Electron 主进程
│   ├── main.js              # 主进程入口（窗口、IPC、托盘）
│   ├── preload.js           # Preload 脚本（contextBridge）
│   └── python-bridge.js     # Python 子进程管理器
├── public/                  # 静态资源
│   └── icon.png
├── resources/               # Python 核心业务脚本 (.pyw)
│   ├── AppCpuPriorityTools.pyw
│   ├── File_Music.pyw
│   └── Win32PrioritySeparation.pyw
├── src/                     # React 前端源码
│   ├── App.tsx              # 应用根组件（路由、布局、Provider）
│   ├── main.tsx             # ReactDOM 入口
│   ├── vite-env.d.ts        # Vite 类型声明
│   ├── components/          # 应用级组件
│   │   ├── ConfirmDialog.tsx
│   │   ├── GlassCard.tsx
│   │   ├── Sidebar.tsx
│   │   ├── TitleBar.tsx
│   │   └── Toast.tsx
│   ├── contexts/            # React Context
│   │   ├── ConfirmContext.tsx
│   │   ├── LanguageContext.tsx
│   │   └── ToastContext.tsx
│   ├── design-system/       # ★ Liquid Glass 设计系统（核心）
│   │   ├── index.ts         # 统一导出入口
│   │   ├── animations/      # 动画定义 (framer-motion)
│   │   ├── components/      # 12 个 Glass 组件
│   │   ├── layouts/         # 布局组件
│   │   ├── materials/       # 材质系统
│   │   └── tokens/          # 设计令牌（颜色、模糊、间距）
│   ├── hooks/               # 自定义 Hooks
│   │   ├── useActivityLog.ts
│   │   ├── useMouseGlow.ts
│   │   ├── usePythonBridge.ts
│   │   └── useTheme.tsx
│   ├── pages/               # 页面组件（懒加载）
│   │   ├── AppCpuPriority.tsx
│   │   ├── BackupCenter.tsx
│   │   ├── Dashboard.tsx
│   │   ├── MusicManager.tsx
│   │   ├── Settings.tsx
│   │   └── Win32Priority.tsx
│   ├── styles/              # 全局样式
│   │   └── globals.css
│   ├── types/               # TypeScript 类型定义
│   │   └── index.ts
│   └── utils/               # 工具函数
│       └── animations.ts
├── .gitignore
├── icon.ico
├── icon.png
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.electron.json
└── vite.config.ts
```

---

## 架构详解

### 四层架构

```
React 19 Frontend (TypeScript)
    ↕ IPC invoke (contextBridge)
Electron 42 Main Process (Node.js)
    ↕ JSON-RPC stdin/stdout
Python 3.13 Bridge (server.py)
    ↕ importlib 动态加载
resources/*.pyw (核心业务)
```

### 1. 前端层 (`src/`)

**入口:** `src/main.tsx` → `src/App.tsx`

**路由:** 基于 `currentPage` 状态的单页导航，页面通过 `React.lazy()` 懒加载实现代码分割。

**状态管理:**
- `useTheme` — 主题切换（8 套主题 + 自动跟随系统）
- `LanguageContext` — 中英文切换
- `ToastContext` — 全局 Toast 通知
- `ConfirmContext` — 全局确认对话框

**设计系统 (`src/design-system/`):**
- **Tokens** — CSS 变量、模糊层级 (`blurHierarchy`)、间距 (`space`, `radii`)、字体 (`fontSizes`)
- **Materials** — 玻璃材质系统，定义不同透明度和模糊级别的表面效果
- **Components** — 12 个 Glass 组件：`GlassSurface`, `GlassCard`, `GlassPanel`, `GlassButton`, `GlassInput`, `GlassModal`, `GlassSelect`, `GlassToggle`, `GlassProgressBar`, `GlassBadge`, `GlassEmptyState`, `GlassGlow`
- **Layouts** — `GlassBackground`, `GlassLayout`, `GlassMain`
- **Animations** — 基于 framer-motion 的 Spring 动画预设 (`springDefault`, `springSnappy`, `springBouncy`, `springGentle`, `springSmooth`) + Glass 运动系统 (`glassEntrance`, `glassReveal`, `glassHover`, `glassPress` 等)

### 2. Electron 层 (`electron/`)

**主进程 (`main.js`):**
- 无边框透明窗口 (frame: false, transparent: true)
- Windows 管理员权限自动提升
- 系统托盘（最小化到托盘、关闭到托盘）
- 窗口位置/大小记忆
- 开机自启动支持
- 单实例锁

**Preload (`preload.js`):**
- 通过 `contextBridge` 暴露 `window.electronAPI`
- API 分组: `window`, `settings`, `python`, `dialog`, `shell`, `app`

**Python Bridge (`python-bridge.js`):**
- 管理 Python 子进程生命周期
- JSON-RPC over stdin/stdout 通信
- 30s 超时 + 自动重连

### 3. Python 层 (`bridge/` + `resources/`)

**Bridge (`bridge/server.py`):**
- JSON-RPC 服务端
- 通过 `importlib` 动态加载 `resources/` 下的业务模块

**核心业务 (`resources/*.pyw`):**
- `Win32PrioritySeparation.pyw` — 注册表读写
- `AppCpuPriorityTools.pyw` — IFEO 规则管理
- `File_Music.pyw` — 音乐元数据编辑与播放

依赖: `pygame`, `psutil`, `mutagen`, `Pillow`

---

## 设计令牌 (Design Tokens)

所有视觉属性通过 CSS 变量控制，位于 `src/design-system/tokens/`：

**颜色 (`colors.ts`):**
- 8 套主题，所有颜色通过 `useTheme` 动态注入 CSS 变量
- 内置亮色/暗色语义色 (`--bg`, `--surface`, `--text`, `--border`, `--accent` 等)

**模糊层级 (`blur.ts`):**
- `glass` (24px) → `surface` (16px) → `subtle` (8px) → `none` (0px)
- 每层有对应的透明度级别

**间距与圆角 (`spacing.ts`):**
- `space` — 4px 基准的间距尺度
- `radii` — 圆角尺度 (sm: 8, md: 14, lg: 20, xl: 28)
- `fontSizes` — 字体大小阶梯
- `zLayers` — z-index 层级 (base: 0, surface: 10, overlay: 100 等)

---

## 质量目标

**Apple Liquid Glass 风格要素:**
- 分层透明度与景深
- 模糊层级递进 (blur hierarchy)
- 微妙折射效果 (subtle refraction)
- Spring 动画 (framer-motion)
- 深色/浅色自适应

**避免:**
- 过度模糊导致性能下降
- 组件风格不一致
- 在页面中创建零散样式（必须走 design-system）

---

## 非项目文件说明

| 路径 | 来源 |
|---|---|
| `node_modules/` | npm 依赖 |
| `dist/` | Vite 构建输出 |
| `dist-electron/` | electron-builder 打包输出 |
| `build-support/` | 嵌入式 Python venv |
| `bridge/__pycache__/` | Python 字节码缓存 |
| `main.js` | 构建过程临时文件 |
| `.patch*.diff` / `*.patch` | 临时补丁文件 |

---

## 运行方式

```bash
# 开发模式
npm run dev              # 同时启动 Vite + Electron

# 单独启动 Vite
npm run vite:dev

# 单独启动 Electron
npm run electron:dev

# 生产构建
npm run build            # Vite 构建 + electron-builder 打包
```

**环境要求:**
- Node.js 22+
- Python 3.13 + 依赖 (`pip install pygame psutil mutagen Pillow`)
- Windows 11（管理员权限）

---

## 设计参考

- [liquid-glass-react](https://github.com/rdev/liquid-glass-react)
- [liquid-dom](https://github.com/AndrewPrifer/liquid-dom)