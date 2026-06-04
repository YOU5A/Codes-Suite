<p align=""center"">
  <img src=""public/icon.png"" width=""120"" alt=""Codes Suite"" />
</p>

<h1 align=""center"">Codes Suite</h1>
<p align=""center"">
  <b>Windows 系统调优 · 一体化工具箱</b><br/>
  <sub>Apple 设计语言 × Fluent Motion × 硬件级性能优化</sub>
</p>

<p align=""center"">
  <img src=""https://img.shields.io/badge/version-1.1.0-blue?style=flat-square"" alt=""Version"" />
  <img src=""https://img.shields.io/badge/platform-Windows%2010%2B-0078D6?style=flat-square&logo=windows"" alt=""Platform"" />
  <img src=""https://img.shields.io/badge/Electron-42%2B-47848F?style=flat-square&logo=electron"" alt=""Electron"" />
  <img src=""https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react"" alt=""React"" />
  <img src=""https://img.shields.io/badge/license-MIT-green?style=flat-square"" alt=""License"" />
</p>

---

## ✨ 概览

**Codes Suite** 是一款为 Windows 打造的现代化系统调优工具箱。融合 **Apple Liquid Glass** 设计语言与 **Framer Motion** 动效引擎，在透明亚克力窗口中提供六项核心功能——从注册表级 CPU 优先级调整到全功能音乐元数据管理，一切触手可及。

<table>
<tr>
<td width=""50%"">

### 🎯 核心功能

- **⚡ Win32 优先级分离** — 读写 Win32PrioritySeparation 注册表键值，内置预设方案与完整备份管理
- **🎛️ 应用 CPU 优先级** — IFEO 注册表级规则 CRUD，支持 JSON 导入/导出
- **🎵 音乐管理器** — MP3/FLAC/OGG/M4A 标签编辑、封面提取与应用、内置音频播放器
- **💾 备份中心** — 注册表备份的快照管理：查看、恢复、导出、清理
- **📊 系统仪表盘** — CPU/内存/磁盘/系统信息实时轮询 + 操作历史
- **⚙️ 深度定制** — 8 套主题、窗口透明度、圆角、动画速度、紧凑模式、字体缩放

</td>
<td width=""50%"">

### 🏗️ 技术架构

`
React 19 Frontend
    ↕ IPC (invoke)
Electron 42 Main Process
    ↕ JSON-RPC stdin/stdout
Python 3.13 Bridge (server.py)
    ↕ importlib 动态导入
resources/*.pyw (核心业务)
`

- **前端**: TypeScript · Tailwind CSS 4 · Framer Motion 12
- **后端**: Embedded Python 3.13 · pygame · mutagen · Pillow
- **通信**: JSON-RPC over stdin/stdout · 30s 超时 · 自动重连

</td>
</tr>
</table>

---

## 🚀 快速开始

`ash
# 克隆仓库
git clone https://github.com/YOU5A/Codes-Suite.git
cd Codes-Suite

# 安装前端依赖
npm install

# 设置嵌入式 Python 环境（需 Python 3.13）
python -m venv build-support/embed-python/venv
build-support/embed-python/venv/Scripts/pip install pygame psutil mutagen Pillow

# 启动开发模式
npm run dev
`

> **注意**: 部分功能需要**管理员权限**。应用启动时自动检测并提升。

---

## 🎨 主题

| 主题 | 类型 | 强调色 |
|---|---|---|
| ☀️ 浅色 | 浅色 | #0071e3 |
| 🌙 深色 | 深色 | #0a84ff |
| 🔄 自动 | 跟随系统 | — |
| ⚫ 石墨 | 浅色 | #5856d6 |
| 🌌 午夜 | 深色 | #6366f1 |
| 🌊 海洋 | 浅色 | #0066cc |
| 🟢 翡翠 | 浅色 | #059669 |
| 🔴 深红 | 深色 | #f43f5e |

---

## 📦 构建

`ash
npm run build    # Vite 构建 + electron-builder 打包

# 产物位于 dist-electron/
# CodesSuite-1.1.0-win-x64-portable.7z
# CodesSuite-1.1.0-win-x64-setup.exe
`

---

## 📁 项目结构

`
Codes-Suite/
├── electron/         # Electron 主进程 · 无边框窗口 · IPC · 托盘
├── src/              # React 前端 · 6 页面 · 8 主题 · 动效系统
├── bridge/           # Python Bridge · JSON-RPC · 34 方法
├── resources/        # Python 核心业务 · 注册表 · 音频 · 备份
├── data/             # 运行时共享配置
└── public/           # 静态资源
`

---

<p align=""center"">
  <sub>Made with ❤️ by <a href=""https://github.com/YOU5A"">YOU5A</a></sub>
</p>
