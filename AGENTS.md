<!--
  AGENTS.md — CodeXa Studio
  重构于 2026-07-24
  精简版：面向 AI Agent 的操作指令
-->

# AGENTS.md — CodeXa Studio

**项目:** CodeXa Studio — Windows 系统调优一体化工具箱
**作者:** YOU5A
**技术栈:** TypeScript 6 · React 19 · Tailwind CSS 4 · Framer Motion 12 · Electron 42 · Python 3.13
**仓库:** https://github.com/YOU5A/CodeXa-Studio
**版本:** 1.3.8

---

## 核心规则

### 语言与编码

- 对话与注释初始语言为中文。
- 所有文本文件使用 UTF-8 without BOM 编码。
- 修改文件时保持原文件编码，不额外添加 BOM。
- Python 读取文本文件时使用 encoding='utf-8' 或 encoding='utf-8-sig'。
- 编写包含中文的代码时不要使用 PowerShell。

### Git 规则

- 没有明确 git 指令时不要私自使用 git。
- 可自行调用 Codex 插件和 Skill。

### 文件删除安全规则

- **禁止批量删除文件或目录。**
- 禁止使用: del /s、d /s、mdir /s、Remove-Item -Recurse、m -rf。
- 删除文件时只能一次删除一个明确路径的文件: Remove-Item "C:\path\to\file.txt"
- 如需批量删除，必须停止操作，让用户手动处理。

---

## 编码行为准则

1. **先思考再编码** — 明确假设，有疑问先问。
2. **简洁优先** — 只写解决问题所需的最少代码，不过度抽象。
3. **精准修改** — 只改需要改的，不顺手"优化"无关代码，匹配现有代码风格。
4. **目标驱动** — 以可验证的成功标准定义任务，循环直到验证通过。

---

## Liquid Glass 设计系统规则

### 迁移原则

- **只修改:** UI、组件、样式、动画。
- **不修改:** 业务逻辑、API、路由、状态管理。
- **所有 UI 必须使用 src/design-system**，禁止在页面内创建零散样式。
- **执行流程:** 检查现有代码 → 理解架构 → 解释方案 → 分阶段推进。禁止盲目重写。

### Light DOM 渲染策略

- 全量使用 Light DOM（不使用 Shadow DOM），确保 Electron offscreen 截图可见。
- 禁止 Web Component custom element。
- 使用常规 HTML 元素 + CSS 类名 + data 属性。
- 样式直接通过 CSS 文件引入，不依赖 Shadow DOM 隔离。

---

## 项目结构速览

`
CodeXa-Studio/
├── bridge/                     # Python JSON-RPC 服务端
│   └── server.py               # RPC 入口（26 个方法路由）
├── electron/                   # Electron 主进程
│   ├── main.js                 # 窗口、IPC、托盘、提权
│   ├── preload.js              # contextBridge → window.electronAPI
│   └── python-bridge.js        # Python 子进程管理器
├── resources/                  # Python 核心业务 (.pyw)
│   ├── Win32PrioritySeparation.pyw
│   ├── AppCpuPriorityTools.pyw
│   └── File_Music.pyw
├── src/                        # React 前端
│   ├── App.tsx                 # 根组件（路由、布局、Provider）
│   ├── components/             # 应用级组件
│   │   ├── FluidBackground/    # Canvas 流体背景子系统
│   │   ├── Sidebar.tsx
│   │   ├── TitleBar.tsx
│   │   └── Toast.tsx
│   ├── contexts/               # 5 个 Context
│   │   ├── LanguageContext.tsx
│   │   ├── MusicPlayerContext.tsx
│   │   ├── ToastContext.tsx
│   │   └── ConfirmContext.tsx
│   ├── design-system/          # ★ Liquid Glass 核心（禁止自创样式）
│   │   ├── tokens/             # colors / blur / spacing
│   │   ├── materials/          # 4 级玻璃材质
│   │   ├── components/         # 12 个 Glass 组件
│   │   ├── layouts/            # GlassBackground / GlassLayout / GlassMain
│   │   └── animations/         # springs / glass / 基础变体
│   ├── hooks/                  # useTheme / usePythonBridge / useMouseGlow
│   ├── pages/                  # 6 个页面 (React.lazy 懒加载)
│   ├── styles/globals.css      # Tailwind + CSS 变量主题
│   ├── types/index.ts          # 全局类型 + ElectronAPI 声明
│   └── utils/                  # animations / colorExtractor
├── public/icon.png
├── package.json
├── vite.config.ts
└── tsconfig.json
`

### 四层架构

`
React 19 (TypeScript)  ←IPC→  Electron 42  ←JSON-RPC→  Python 3.13 (bridge/server.py)  →  resources/*.pyw
`

### 关键 Context 与 Hook

| 名称 | 类型 | 用途 |
|------|------|------|
| useTheme | Hook | 8 套主题切换 + localStorage 持久化 |
| LanguageContext | Context | 中英文切换，同步到 Python Bridge |
| ToastContext | Context | 全局 Toast (success/warning/error/info) |
| ConfirmContext | Context | 全局确认对话框 |
| MusicPlayerContext | Context | HTML5 Audio 播放器状态 |
| usePythonBridge | Hook | Python JSON-RPC 调用封装 |
| useMouseGlow | Hook | 鼠标光晕追踪 |
| useActivityLog | Hook | 操作历史记录 |

### 流体背景系统

位于 src/components/FluidBackground/，Canvas 2D 流体动态背景：
- 7 套预设: aurora / ocean / ember / nebula / plasma / forest / cover
- 支持 auto（主题自适应）和 custom 模式
- 鼠标交互（光晕跟随）、速度/强度/模糊调节
- 配置独立持久化到 localStorage key luid-background-config

---

## 设计令牌速查

| 类别 | 文件 | 核心值 |
|------|------|--------|
| 颜色 | 	okens/colors.ts | 8 套主题 CSS 变量，4 级 glass 表面色 |
| 模糊 | 	okens/blur.ts | glass(24px) → surface(16px) → subtle(8px) → none(0px) |
| 间距 | 	okens/spacing.ts | 4px 基准 · 圆角 sm/md/lg/xl · z-index base→tooltip |
| 材质 | materials/materials.ts | ultraThin → regular → thick → elevated |

---

## 非项目文件（忽略）


ode_modules/ · dist/ · dist-electron/ · uild-support/ · __pycache__/ · main.js（临时）· .patch*.diff · docs/

---

## 运行命令

`ash
npm run dev          # 开发模式 (Vite + Electron)
npm run vite:dev     # 仅 Vite
npm run electron:dev # 仅 Electron
npm run build        # 生产构建
`

**环境:** Node.js 22+ · Python 3.13 (psutil, mutagen, Pillow) · Windows 11 (管理员权限)

**Vite 配置:** 端口 5173 · base: ./ · chunk: react-vendor / motion-vendor / icons-vendor

---

## 设计参考

- [liquid-glass-react](https://github.com/rdev/liquid-glass-react)
- [liquid-dom](https://github.com/AndrewPrifer/liquid-dom)