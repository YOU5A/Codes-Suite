<!--
  AGENTS.md — Codes Suite
  自动生成于 2026-07-23
  基于项目实际源码与结构分析
  遵循 rebuild-agents-md skill 规范
-->

# AGENTS.md — Codes Suite

**项目名称:** Codes Suite
**作者:** YOU5A
**技术栈:** TypeScript 6 · React 19 · Tailwind CSS 4 · Framer Motion 12 · Electron 42 · Python 3.13
**语言:** TypeScript / Python (英文标识符，中文注释与 UI 文字)
**仓库:** https://github.com/YOU5A/Codes-Suite
**版本:** 1.3.0

---

## 通用设置

- 通用初始语言为中文。
- GitHub 仓库: https://github.com/YOU5A/
- 可以自行调用 Codex 插件和 Skill。
- 没有使用 git 的指令不要私自使用 git。

### 编码规范

- 编写包含中文的代码时不要使用 PowerShell。
- 所有文本文件统一使用 UTF-8 without BOM 编码。
- 不要创建带 BOM 的文件。
- 修改文件时保持原文件的编码格式，不额外添加 BOM。
- Python 读取文本文件时使用 encoding='utf-8' 或 encoding='utf-8-sig'。

### 文件删除安全规则

- **禁止批量删除文件或目录。**
- 不要使用以下命令：
  - del /s
  - d /s
  - mdir /s
  - Remove-Item -Recurse
  - m -rf
- 删除文件时只能一次删除一个**明确路径**的文件。

正确示例：
`
Remove-Item "C:\path\to\file.txt"
`

- 如果任务需要批量删除文件，必须停止操作并向用户请求，让用户手动处理。

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
- **所有 UI 必须使用 src/design-system**，禁止在页面内创建零散样式。
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
- Python 读取文件时使用 encoding='utf-8' 或 encoding='utf-8-sig'。
- 没有 git 指令时不要私自使用 git。
- **禁止批量删除文件或目录**（m -rf、Remove-Item -Recurse 等）。

---

## 项目概述

Codes Suite 是 Windows 系统调优一体化工具箱，融合 Apple Liquid Glass 设计语言与 Framer Motion 动效引擎，提供六项核心功能：

| 模块 | 功能 |
|---|---|
| Win32 优先级分离 | 读写 Win32PrioritySeparation 注册表键值，内置预设方案与备份管理 |
| 应用 CPU 优先级 | IFEO 注册表级规则 CRUD，支持 JSON 导入/导出 |
| 音乐管理器 | MP3/FLAC/OGG/M4A 标签编辑、封面提取、内置播放器 |
| 备份中心 | 注册表备份快照管理：查看、恢复、导出、清理 |
| 系统仪表盘 | CPU/内存/磁盘/系统信息实时轮询 + 操作历史 |
| 深度定制 | 8 套主题、窗口透明度、圆角、动画速度、紧凑模式、字体缩放 |

此外还有：
- **流体背景系统** — Canvas 2D 流体动态背景，支持预设切换、鼠标交互、颜色自适应
- **音乐播放器** — 基于 HTML5 Audio 的内置播放器（MusicPlayerContext），支持播放/暂停/跳转

---

## 项目结构

`
Codes-Suite/
├── bridge/                     # Python JSON-RPC 服务端
│   ├── config.json             # Bridge 配置
│   └── server.py               # Python Bridge 入口 + RPC 方法路由
├── build-support/              # 嵌入式 Python venv 构建支持 (gitignored)
├── data/                       # 用户数据目录 (运行时生成)
├── docs/                       # 设计文档与迁移报告
│   ├── final-report.md
│   ├── fluid-background-design.md
│   ├── fluid-background-integration.md
│   ├── layout-report.md
│   ├── liquid-glass-audit.md
│   ├── liquid-glass-plan.md
│   ├── page-migration-order.md
│   └── performance-report.md
├── electron/                   # Electron 主进程
│   ├── main.js                 # 主进程入口（窗口、IPC、托盘、设置持久化）
│   ├── preload.js              # Preload 脚本（contextBridge → window.electronAPI）
│   └── python-bridge.js        # Python 子进程管理器（JSON-RPC stdin/stdout）
├── public/                     # 静态资源
│   └── icon.png
├── resources/                  # Python 核心业务脚本 (.pyw)
│   ├── AppCpuPriorityTools.pyw  # IFEO 注册表规则 CRUD
│   ├── File_Music.pyw           # 音乐元数据编辑与封面提取
│   └── Win32PrioritySeparation.pyw  # Win32 优先级注册表读写
├── src/                        # React 前端源码
│   ├── App.tsx                 # 应用根组件（路由、布局、Provider 容器、FluidBackground 集成）
│   ├── main.tsx                # ReactDOM 入口
│   ├── vite-env.d.ts           # Vite 类型声明
│   ├── components/             # 应用级组件
│   │   ├── ConfirmDialog.tsx   # 全局确认对话框
│   │   ├── FluidBackground/    # ★ Canvas 流体背景子系统
│   │   │   ├── index.tsx       #   React 组件（Canvas 挂载与生命周期）
│   │   │   ├── config.ts       #   运行时配置类型与 localStorage 持久化
│   │   │   ├── presets.ts      #   预设色彩方案
│   │   │   └── renderer.ts     #   Canvas 2D 流体渲染引擎
│   │   ├── FluidSettingsPanel.tsx  # 流体背景设置面板（GlassModal 承载）
│   │   ├── GlassCard.tsx       # 兼容性 GlassCard 封装（委托 design-system）
│   │   ├── Sidebar.tsx         # 侧边导航栏
│   │   ├── TitleBar.tsx        # 自定义标题栏（窗口控制）
│   │   └── Toast.tsx           # 全局 Toast 通知容器
│   ├── contexts/               # React Context 状态管理
│   │   ├── ConfirmContext.tsx   # 确认对话框控制
│   │   ├── LanguageContext.tsx  # 中英文切换
│   │   ├── MusicPlayerContext.tsx  # 音频播放器状态（HTML5 Audio 封装）
│   │   └── ToastContext.tsx     # Toast 通知控制
│   ├── design-system/          # ★ Liquid Glass 设计系统（核心，禁止在页面内自创样式）
│   │   ├── index.ts            # 统一导出入口
│   │   ├── animations/         # 动画定义 (framer-motion)
│   │   │   ├── index.ts        #   基础动画预设
│   │   │   ├── springs.ts      #   Spring 物理曲线
│   │   │   └── glass.ts        #   Glass 运动系统 (entrance/reveal/hover/press)
│   │   ├── components/         # 12 个 Glass 组件
│   │   │   ├── index.ts        #   集中导出 + 类型导出
│   │   │   ├── GlassSurface.tsx
│   │   │   ├── GlassCard.tsx
│   │   │   ├── GlassPanel.tsx
│   │   │   ├── GlassButton.tsx
│   │   │   ├── GlassInput.tsx
│   │   │   ├── GlassModal.tsx
│   │   │   ├── GlassSelect.tsx
│   │   │   ├── GlassToggle.tsx
│   │   │   ├── GlassProgressBar.tsx
│   │   │   ├── GlassBadge.tsx
│   │   │   ├── GlassEmptyState.tsx
│   │   │   └── GlassGlow.tsx
│   │   ├── layouts/            # 布局组件
│   │   │   ├── index.ts
│   │   │   ├── GlassBackground.tsx  # 渐变网格 + 动态光效背景
│   │   │   ├── GlassLayout.tsx      # 根布局（集成 FluidBackground）
│   │   │   └── GlassMain.tsx        # 主内容区
│   │   ├── materials/          # 材质系统
│   │   │   ├── index.ts
│   │   │   └── materials.ts    # 四级材质定义 (ultraThin/regular/thick/elevated)
│   │   └── tokens/             # 设计令牌
│   │       ├── index.ts
│   │       ├── blur.ts         # 模糊层级 + backdrop-filter
│   │       ├── colors.ts       # 颜色令牌 (CSS_VARS/glass/surface)
│   │       └── spacing.ts      # 间距/圆角/字号/图标/z-index 尺度
│   ├── hooks/                  # 自定义 Hooks
│   │   ├── useActivityLog.ts   # 操作历史记录
│   │   ├── useMouseGlow.ts     # 鼠标光晕追踪
│   │   ├── usePythonBridge.ts  # Python JSON-RPC 调用封装
│   │   └── useTheme.tsx        # 主题管理 (8 套主题 + 设置持久化)
│   ├── pages/                  # 页面组件（React.lazy 懒加载）
│   │   ├── AppCpuPriority.tsx  # 应用 CPU 优先级管理
│   │   ├── BackupCenter.tsx    # 备份中心
│   │   ├── Dashboard.tsx       # 系统仪表盘
│   │   ├── MusicManager.tsx    # 音乐管理器
│   │   ├── Settings.tsx        # 深度定制（主题/透明度/动画/流体背景）
│   │   └── Win32Priority.tsx   # Win32 优先级分离
│   ├── styles/                 # 全局样式
│   │   └── globals.css         # Tailwind CSS 导入 + CSS 变量主题系统
│   ├── types/                  # TypeScript 类型定义
│   │   └── index.ts            # 全局类型（SystemInfo/PriorityRule/MusicMetadata 等 + ElectronAPI 声明）
│   └── utils/                  # 工具函数
│       ├── animations.ts       # 动画时长计算 + CSS transition 辅助
│       └── colorExtractor.ts   # RGB ↔ HSL 颜色空间转换
├── .gitignore
├── icon.ico
├── icon.png
├── index.html                  # Vite HTML 入口 (<html lang="zh">)
├── package.json                # npm 包定义 + electron-builder 配置
├── tsconfig.json               # TypeScript 编译配置 (strict, paths: @/*)
└── vite.config.ts              # Vite 构建配置 (React + Tailwind + 代码分割)
`

---

## 架构详解

### 四层架构

`
React 19 Frontend (TypeScript)
    ↕ IPC invoke (contextBridge)
Electron 42 Main Process (Node.js)
    ↕ JSON-RPC stdin/stdout
Python 3.13 Bridge (server.py)
    ↕ importlib 动态加载
resources/*.pyw (核心业务)
`

### 1. 前端层 (src/)

**入口:** src/main.tsx → src/App.tsx

**路由:** 基于 currentPage 状态的单页导航（6 个页面），页面通过 React.lazy(() => import(...)) 懒加载实现代码分割。

**状态管理 (5 个 Context):**
- useTheme — 主题切换（8 套：light/dark/auto/graphite/midnight/ocean/emerald/crimson）+ 设置持久化到 localStorage
- LanguageContext — 中英文（zh/en）切换，同步到 Python Bridge 的 config.set
- ToastContext — 全局 Toast 通知（success/warning/error/info）
- ConfirmContext — 全局确认对话框（标题/消息/确认/取消回调）
- MusicPlayerContext — 音频播放器状态（HTML5 Audio 封装），支持播放/暂停/跳转/音量控制

**流体背景系统 (src/components/FluidBackground/):**
- Canvas 2D 流体动态背景（Metaball 渲染）
- 7 套预设色彩方案：aurora / ocean / ember / nebula / plasma / forest / cover
- 支持 auto（根据主题自适应）和 custom 模式
- 鼠标交互（光晕跟随）、速度/强度/模糊调节
- 颜色模式：auto（跟随主题）/ cover（提取封面主色）/ dynamic（动态渐变）
- 配置独立持久化到 localStorage（luid-background-config），不与 AppSettings 耦合
- FluidSettingsPanel 通过 GlassModal 承载所有参数调节

**设计系统 (src/design-system/):**
- **Tokens** — CSS 变量类型安全引用 (CSS_VARS)、模糊层级 (lurHierarchy)、间距尺度 (space, adii)、字体 (ontSizes, iconSizes)、z-index (zLayers)
- **Materials** — 四级玻璃材质 (ultraThin → regular → thick → elevated)，每级完整定义: bg / border / blur / saturation / opacity / backdropFilter / radius / shadow
- **Components** — 12 个 Glass 组件，每个自带 TypeScript Props 类型导出：
  GlassSurface · GlassCard · GlassPanel · GlassButton · GlassInput · GlassModal
  GlassSelect · GlassToggle · GlassProgressBar · GlassBadge · GlassEmptyState · GlassGlow
- **Layouts** — GlassBackground（渐变网格+动态光效）· GlassLayout（根布局，集成 FluidBackground）· GlassMain（主内容区）
- **Animations** —
  - Spring 预设: springDefault · springSnappy · springBouncy · springGentle · springSmooth
  - 基础变体: adeSlideUp · adeOnly · scaleBounce · cardVariants · modalVariants · listItemVariants
  - Glass 运动: glassEntrance · glassReveal · glassPopIn · glassHover · glassLift · glassGhostHover · glassPress · glassPressDeep
  - 页面过渡: pageTransition · contentTransition
  - 交互反馈: hoverScale · hoverLift · glassFocusRing · glassFocusRingOut

### 2. Electron 层 (electron/)

**主进程 (main.js):**
- 无边框透明窗口 (frame: false, transparent: true)
- Windows 管理员权限自动提升（Base64 编码的 PowerShell）
- 系统托盘（最小化到托盘、关闭到托盘）
- 窗口位置/大小记忆（持久化到 electron-settings.json）
- 开机自启动支持
- 单实例锁
- IPC 处理器: window:* / settings:* / python:* / dialog:* / shell:* / pp:*

**Preload (preload.js):**
- 通过 contextBridge 暴露 window.electronAPI
- API 分组: window（最小化/最大化/关闭/透明度/位置）· settings（get/set/getAll）· python（call/status/getFileUrl）· dialog（openFolder/openFile/saveFile）· shell（openPath/openExternal）· pp（getPath）

**Python Bridge (python-bridge.js):**
- 管理 Python 子进程生命周期
- JSON-RPC over stdin/stdout 通信
- 30s 超时 + 自动重连（断开后 2s 重试）
- 缓冲区拼接处理分片数据

### 3. Python 层 (ridge/ + esources/)

**Bridge (ridge/server.py):**
- JSON-RPC 服务端（stdin/stdout 协议）
- 通过 importlib 动态加载 esources/ 下的业务模块
- 模块懒加载（首次 RPC 调用时才加载对应 .pyw）
- 26 个 RPC 方法路由：
  - **System Info:** system.info — 系统信息采集
  - **Registry:** egistry.read / egistry.write / egistry.backup
  - **Admin:** dmin.check / dmin.restart
  - **Priority:** priority.list / priority.add / priority.edit / priority.delete / priority.export / priority.import_config
  - **Music:** music.scan / music.get_metadata / music.save_tags / music.extract_cover / music.apply_cover / music.remove_cover / music.read_cover_file / music.rename
  - **Backup:** ackup.list / ackup.dir / ackup.export / ackup.restore / ackup.delete / ackup.clear_all
  - **Config:** config.get / config.set（含语言同步到所有模块）

**核心业务 (esources/*.pyw):**
- Win32PrioritySeparation.pyw — Win32PrioritySeparation 注册表读写、预设方案、备份管理
- AppCpuPriorityTools.pyw — IFEO (Image File Execution Options) 注册表级规则 CRUD
- File_Music.pyw — MP3/FLAC/OGG/M4A 元数据编辑、封面提取与替换

**依赖:** pygame, psutil, mutagen, Pillow

---

## 设计令牌 (Design Tokens)

所有视觉属性通过 CSS 变量控制，位于 src/design-system/tokens/：

**颜色 (colors.ts):**
- 8 套主题，所有颜色通过 useTheme 动态注入 CSS 变量
- CSS_VARS 常量 — 类型安全 CSS 变量引用（bg / border / text / accent / semantic / layout / transition）
- glass — 四级玻璃表面色：ultraThin / regular / thick / elevated
- surface — 语义别名：sidebar / titlebar / card / panel / modal / input / button / badge

**模糊层级 (lur.ts):**
- glass (24px) → surface (16px) → subtle (8px) → 
one (0px)
- 每层有对应的透明度级别和饱和度
- 导出 getBackdropFilter() 工具函数

**间距与圆角 (spacing.ts):**
- space — 4px 基准间距尺度
- adii — 圆角尺度 (sm: 8, md: 14, lg: 20, xl: 28)
- ontSizes — 字体大小阶梯
- iconSizes — 图标尺寸阶梯
- zLayers — z-index 层级 (base: 0 → surface: 10 → overlay: 100 → modal: 200 → toast: 300 → tooltip: 400)

**材质 (materials.ts):**
- 四级材质: ultraThin → egular → 	hick → elevated
- 每级完整定义: bg / border / blur / saturation / opacity / backdropFilter / radius / shadow
- 导出 materials 目录、getMaterial() 查询函数、materialToStyle() 转换函数

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
- 禁止使用 Shadow DOM / Web Component

---

## 非项目文件说明

| 路径 | 来源 |
|---|---|
| 
ode_modules/ | npm 依赖 |
| dist/ | Vite 构建输出 |
| dist-electron/ | electron-builder 打包输出 |
| uild-support/ | 嵌入式 Python venv |
| ridge/__pycache__/ | Python 字节码缓存 |
| esources/__pycache__/ | Python 字节码缓存 |
| main.js | 构建过程临时文件 |
| .patch*.diff / *.patch | 临时补丁文件 |
| docs/ | 设计文档与迁移报告 (gitignored) |

---

## 运行方式

`ash
# 开发模式
npm run dev              # 同时启动 Vite + Electron

# 单独启动 Vite
npm run vite:dev

# 单独启动 Electron
npm run electron:dev

# 生产构建
npm run build            # Vite 构建 + electron-builder 打包
`

**环境要求:**
- Node.js 22+
- Python 3.13 + 依赖 (pip install pygame psutil mutagen Pillow)
- Windows 11（管理员权限）

**构建产物:**
- dist/ — Vite 前端产物 (React + Tailwind)
- dist-electron/ — electron-builder 打包输出：Portable (.exe) + NSIS 安装包
- 打包时 ridge/、esources/、icon.ico 作为 extraResources 嵌入

**Vite 构建配置:**
- 代码分割: react-vendor / motion-vendor / icons-vendor 三个 chunk
- CSS Minify 开启
- base: ./ (相对路径，兼容 Electron file:// 协议)
- 端口: 5173 (strictPort)

---

## 设计参考

- [liquid-glass-react](https://github.com/rdev/liquid-glass-react)
- [liquid-dom](https://github.com/AndrewPrifer/liquid-dom)