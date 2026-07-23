<p align="center">
  <picture>
    <img src="public/icon.png" width="140" alt="CodeXa Studio" />
  </picture>
</p>

<h1 align="center">CodeXa Studio</h1>

<p align="center">
  <b>Windows 系统调优，从未如此优雅</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-1.3.8-blue?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Windows-11-0078D6?style=for-the-badge&logo=windows11" />
  <img src="https://img.shields.io/badge/Electron-42-47848F?style=for-the-badge&logo=electron" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-6-3178C6?style=flat-square&logo=typescript" />
  <img src="https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss" />
  <img src="https://img.shields.io/badge/Python-3.13-3776AB?style=flat-square&logo=python" />
  <img src="https://img.shields.io/badge/Framer_Motion-12-0055FF?style=flat-square&logo=framer" />
  <img src="https://img.shields.io/badge/license-AGPL--3.0-green?style=flat-square" />
</p>

---

## 这是什么

**CodeXa Studio** 是一款 Windows 系统调优一体化工具箱。融合 **Apple Liquid Glass 设计语言** 与 **Framer Motion** 动效引擎，把注册表编辑、CPU 调度、音乐标签管理这些硬核操作装进一块玻璃面板里。

### 亮点

- **Liquid Glass 设计系统** — 4 级模糊景深、12 个 Glass 组件、30+ 动画预设
- **Canvas 流体背景** — 7 套动态预设 + 鼠标交互 + 封面颜色提取
- **8 套主题** — 明暗自动切换，石墨 / 午夜 / 海洋 / 翡翠 / 深红
- **Spring 物理动画** — 一切交互都有质感，framer-motion 驱动
- **无边框透明窗口** — Electron 42，管理员权限自动提权

---

## 功能模块

| 模块 | 功能 | 技术要点 |
|------|------|----------|
| **Win32 优先级分离** | CPU 调度注册表读写，内置预设方案与备份管理 | HKLM\SYSTEM\...\Win32PrioritySeparation |
| **应用 CPU 优先级** | IFEO 注册表级规则 CRUD，JSON 导入/导出 | HKLM\SOFTWARE\...\Image File Execution Options |
| **音乐管理器** | MP3/FLAC/OGG/M4A 标签编辑 + 封面提取 + 内置播放器 | mutagen · Pillow · HTML5 Audio |
| **备份中心** | 注册表快照管理：查看、恢复、导出、清理 | JSON-RPC 注册表 batch 操作 |
| **系统仪表盘** | CPU/内存/磁盘实时轮询 + 操作历史 | psutil · Python Bridge |
| **深度定制** | 主题、透明度、圆角、动画速度、紧凑模式、字体缩放、流体背景 | CSS 变量 · localStorage 持久化 |

---

## 架构

`
React 19 (TypeScript)  ←→  Electron 42 (IPC)  ←→  Python 3.13 (JSON-RPC)
`

| 层 | 技术 | 说明 |
|----|------|------|
| **前端** | React 19 · TypeScript 6 · Tailwind CSS 4 · Framer Motion 12 | 6 页面懒加载 · 5 个 Context · 设计系统 |
| **桌面** | Electron 42 | 无边框透明窗口 · 系统托盘 · 单实例锁 · 自动提权 |
| **桥接** | JSON-RPC stdin/stdout | 30s 超时 · 自动重连 · 26 个 RPC 方法 |
| **后端** | Python 3.13 | psutil · mutagen · Pillow · 注册表操作 |

### 项目结构

`
CodeXa-Studio/
├── bridge/server.py          # Python JSON-RPC 服务端
├── electron/                 # Electron 主进程
│   ├── main.js               # 窗口、IPC、托盘、提权
│   ├── preload.js            # contextBridge API
│   └── python-bridge.js      # Python 子进程管理
├── resources/                # Python 业务脚本 (.pyw)
├── src/                      # React 前端
│   ├── design-system/        # Liquid Glass 设计系统
│   ├── components/           # FluidBackground、Sidebar、TitleBar
│   ├── contexts/             # Theme / Language / Toast / Confirm / MusicPlayer
│   ├── pages/                # 6 个功能页面
│   └── hooks/                # usePythonBridge / useMouseGlow / useActivityLog
├── package.json
├── vite.config.ts
└── tsconfig.json
`

---

## 安装与运行

### 环境要求

- **Windows 11**（管理员权限）
- **Node.js** 22+
- **Python** 3.13

### 安装依赖

`ash
# Python 依赖
pip install psutil mutagen Pillow

# 前端依赖
npm install
`

### 开发

`ash
npm run dev          # 同时启动 Vite + Electron
npm run vite:dev     # 仅启动 Vite 开发服务器
npm run electron:dev # 仅启动 Electron 窗口
`

### 构建

`ash
npm run build        # Vite 构建 + electron-builder 打包
`

构建产物:
- dist/ — Vite 前端产物
- dist-electron/ — Portable .exe + NSIS 安装包

> **下载:** [github.com/YOU5A/CodeXa-Studio/releases](https://github.com/YOU5A/CodeXa-Studio/releases)

---

## 主题

☀️ 浅色 · 🌙 深色 · 🔄 自动 · 🩶 石墨 · 🌑 午夜 · 🌊 海洋 · 🟢 翡翠 · 🔴 深红

---

## 贡献

AI Agent 请先阅读 [AGENTS.md](./AGENTS.md)。

欢迎提交 Issue 和 Pull Request。

---

## 许可

AGPL-3.0 © 2025 YOU5A

---

<p align="center">
  <sub>Crafted with ❤️ by <a href="https://github.com/YOU5A">YOU5A</a></sub>
</p>