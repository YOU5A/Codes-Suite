<p align="center">
  <img src="public/icon.png" width="120" alt="Codes Suite" />
</p>

<h1 align="center">Codes Suite</h1>
<p align="center">
  <b>Windows 系统调优 · 一体化工具箱</b><br/>
  <sub>Apple Liquid Glass × Fluent Motion × 硬件级性能优化</sub>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-1.1.0-blue?style=flat-square" alt="Version" />
  <img src="https://img.shields.io/badge/platform-Windows%2010%2B-0078D6?style=flat-square&logo=windows" alt="Platform" />
  <img src="https://img.shields.io/badge/Electron-42%2B-47848F?style=flat-square&logo=electron" alt="Electron" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="License" />
</p>

---

## About

**Codes Suite** 是一款为 Windows 打造的现代化系统调优工具箱。融合 Apple Liquid Glass 设计语言与 Framer Motion 动效引擎，在透明亚克力窗口中提供六项核心功能，从注册表级 CPU 优先级调整到全功能音乐元数据管理，一切触手可及。

---

## 安装

前往 [Releases](https://github.com/YOU5A/Codes-Suite/releases) 页面下载最新版本：

| 版本 | 文件 | 说明 |
|---|---|---|
| **安装版** | `CodesSuite-1.1.0-win-x64-setup.exe` | 标准安装程序，支持自定义安装路径 |
| **便携版** | `CodesSuite-1.1.0-win-x64-portable.7z` | 解压即用，无需安装 |

> 自备 Python 3.13 环境，安装依赖：`pip install pygame psutil mutagen Pillow`
>
> 部分功能需要**管理员权限**，应用启动时自动检测并提升。

---

## 核心功能

| 模块 | 功能 |
|---|---|
| Win32 优先级分离 | 读写 `Win32PrioritySeparation` 注册表键值，内置预设方案与完整备份管理 |
| 应用 CPU 优先级 | IFEO 注册表级规则 CRUD，支持 JSON 导入/导出 |
| 音乐管理器 | MP3/FLAC/OGG/M4A 标签编辑、封面提取与应用、内置音频播放器 |
| 备份中心 | 注册表备份的快照管理：查看、恢复、导出、清理 |
| 系统仪表盘 | CPU/内存/磁盘/系统信息实时轮询 + 操作历史 |
| 深度定制 | 8 套主题、窗口透明度、圆角、动画速度、紧凑模式、字体缩放 |

---

## 技术架构

```
React 19 Frontend
    ↕ IPC (invoke)
Electron 42 Main Process
    ↕ JSON-RPC stdin/stdout
Python 3.13 Bridge (server.py)
    ↕ importlib dynamic import
resources/*.pyw (Core Business)
```

| 层 | 技术栈 |
|---|---|
| 前端 | TypeScript 6 · React 19 · Tailwind CSS 4 · Framer Motion 12 |
| 桌面 | Electron 42 · 无边框窗口 · 亚克力材质 · 系统托盘 |
| 后端 | Python 3.13 · pygame · mutagen · Pillow · psutil |
| 通信 | JSON-RPC over stdin/stdout · 30s 超时 · 自动重连 |

---

## 主题

| 主题 | 类型 | 强调色 |
|---|---|---|
| 浅色 | Light | `#0071e3` |
| 深色 | Dark | `#0a84ff` |
| 自动 | 跟随系统 | — |
| 石墨 | Light | `#5856d6` |
| 午夜 | Dark | `#6366f1` |
| 海洋 | Light | `#0066cc` |
| 翡翠 | Light | `#059669` |
| 深红 | Dark | `#f43f5e` |

---

<p align="center">
  <sub>Made with ❤️ by <a href="https://github.com/YOU5A">YOU5A</a></sub>
</p>