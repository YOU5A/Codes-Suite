<p align="center">
  <picture>
    <img src="public/icon.png" width="140" alt="Codes Suite" />
  </picture>
</p>

<h1 align="center">Codes Suite</h1>

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
  <img src="https://img.shields.io/badge/license-AGPL--3.0-green?style=flat-square" />
</p>

---

## 这是什么

一款 Windows 系统调优工具箱。融合 **Apple Liquid Glass 设计语言** 与 **Framer Motion** 动效，把注册表编辑、CPU 调度、音乐标签管理这些硬核操作装进一块玻璃面板里。

- 无边框透明窗口，4 级模糊景深
- Canvas 2D 流体动态背景，7 套预设 + 鼠标交互
- 8 套主题，明暗自动切换
- Spring 物理动画，一切交互都有质感
- 需管理员权限，启动自动提权

---

## 能做什么

| 模块 | 功能 |
|---|---|
| **Win32 优先级分离** | 读写 CPU 调度注册表，内置预设方案与备份 |
| **应用 CPU 优先级** | IFEO 规则 CRUD，JSON 导入/导出 |
| **音乐管理器** | MP3/FLAC/OGG/M4A 标签编辑 + 封面提取 + 内置播放 |
| **备份中心** | 注册表快照管理：查看、恢复、导出 |
| **系统仪表盘** | CPU/内存/磁盘实时监控 + 操作历史 |
| **深度定制** | 8 套主题、透明度、圆角、动画速度、紧凑模式、字体缩放、流体背景 |

---

## 架构

```
React 19 (TypeScript)  ←→  Electron 42  ←→  Python 3.13 (JSON-RPC)
```

| | |
|---|---|
| **前端** | React 19 · TypeScript 6 · Tailwind CSS 4 · Framer Motion 12 |
| **设计系统** | Liquid Glass 设计系统（12 个组件 · 4 级材质 · 30+ 动画预设） |
| **桌面** | Electron 42 · 无边框透明窗口 · 系统托盘 · 自动提权 |
| **后端** | Python 3.13 · psutil · mutagen · Pillow |

---

## 安装

```bash
# Python 依赖
pip install psutil mutagen Pillow

# 前端依赖
npm install

# 开发模式
npm run dev

# 生产构建
npm run build
```

> **Releases:** [github.com/YOU5A/Codes-Suite/releases](https://github.com/YOU5A/Codes-Suite/releases)

---

## 主题

☀️ 浅色 · 🌙 深色 · 🔄 自动 · 🩶 石墨 · 🌑 午夜 · 🌊 海洋 · 🟢 翡翠 · 🔴 深红

---

## 协作

AI Agent 请先读 [AGENTS.md](./AGENTS.md)。

---

<p align="center">
  <sub>Crafted with ❤️ by <a href="https://github.com/YOU5A">YOU5A</a></sub>
</p>