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
  <img src="https://img.shields.io/badge/version-1.3.0-blue?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Windows-11-0078D6?style=for-the-badge&logo=windows11" />
  <img src="https://img.shields.io/badge/Electron-42-47848F?style=for-the-badge&logo=electron" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-6-3178C6?style=flat-square&logo=typescript" />
  <img src="https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss" />
  <img src="https://img.shields.io/badge/Python-3.13-3776AB?style=flat-square&logo=python" />
  <img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" />
</p>

---

##   What is Codes Suite?

一款融合 **Apple Liquid Glass 设计语言** 与 **Framer Motion 动效引擎** 的 Windows 系统调优工具箱。

不是又一个丑陋的「绿色小工具」── 这是一个用 **React 19** + **Electron 42** 构建的现代化桌面应用。无边框透明窗口、多层玻璃质感、Spring 物理动画、8 套精心调校的主题。从注册表层 CPU 优先级到 MP3/FLAC 音乐标签管理，六项硬核功能藏在六块玻璃面板之下。

---

## ✨ 亮点

<table>
<tr>
<td width="50%">

###   Liquid Glass 设计系统

不是简单的半透明背景，而是一套完整的 **材质层级系统**：

- **4 级模糊递进** — glass (24px) → surface (16px) → subtle (8px) → none
- **多层透明度** — 每级模糊匹配对应透明度，形成景深感
- **色彩自适应** — 明暗主题下自动调整对比度
- **Spring 动画** — 进场、悬停、按压，一切动效都有物理质感

所有 UI 组件统一派生自 `src/design-system/`，零散样式禁止进入业务页面。

</td>
<td width="50%">

### ⚙️ 硬核系统能力

- **Win32 优先级分离** — 直接读写 `Win32PrioritySeparation` 注册表，影响整个系统的 CPU 调度策略
- **IFEO 规则引擎** — 按应用名设置 CPU/IO 优先级，支持 JSON 批量导入导出
- **注册表备份中心** — 快照式备份管理，随时恢复、导出、对比
- **音乐元数据编辑** — MP3/FLAC/OGG/M4A 标签编辑 + 封面提取 + 内建播放器
- **实时系统仪表盘** — CPU/内存/磁盘轮询 + 操作历史记录

需管理员权限，启动时自动提权。

</td>
</tr>
</table>

---

##  主题

8 套精心调校的主题，每套都有独立的 CSS 变量调色板：

| | | | |
|---|---|---|---|
| ☀️ **浅色** `#0071e3` |  **深色** `#0a84ff` |  **自动** 跟随系统 |  **石墨** `#5856d6` |
|  **午夜** `#6366f1` |  **海洋** `#0066cc` |  **翡翠** `#059669` |  **深红** `#f43f5e` |

每套主题动态注入 `--bg` `--surface` `--text` `--border` `--accent` 等语义 CSS 变量，所有组件自动响应。

---

##  架构

```
┌──────────────────────────────────────────┐
│  React 19 Frontend (TypeScript)          │
│  src/design-system/  ← 所有 UI 的基础    │
└──────────────┬───────────────────────────┘
               │ IPC invoke (contextBridge)
┌──────────────┴───────────────────────────┐
│  Electron 42 Main Process (Node.js)      │
│  无边框透明窗口 · 系统托盘 · 管理员提权  │
└──────────────┬───────────────────────────┘
               │ JSON-RPC stdin/stdout
┌──────────────┴───────────────────────────┐
│  Python 3.13 Bridge (server.py)          │
│  子进程管理 · 30s 超时 · 自动重连        │
└──────────────┬───────────────────────────┘
               │ importlib 动态加载
┌──────────────┴───────────────────────────┐
│  resources/*.pyw                         │
│  注册表读写 · IFEO 管理 · 音乐元数据     │
└──────────────────────────────────────────┘
```

| 层 | 技术 |
|---|---|
| **渲染** | React 19 · TypeScript 6 · Tailwind CSS 4 · Framer Motion 12 · Lucide Icons |
| **桌面** | Electron 42 · 无边框透明窗口 · 系统托盘 · 单实例锁 · 开机自启 |
| **通信** | contextBridge IPC → JSON-RPC over stdin/stdout → importlib |
| **后端** | Python 3.13 · pygame · mutagen · Pillow · psutil |

---

##  项目布局

```
src/
├── design-system/          ★ 设计系统（唯一样式来源）
│   ├── tokens/             色彩 · 模糊 · 间距 · 圆角 · z-index
│   ├── materials/          玻璃材质配方
│   ├── components/         12 个 Glass 组件
│   ├── animations/         Spring 预设 + Glass 运动系统
│   └── layouts/            背景 · 主布局 · 内容区
├── pages/                  6 个业务页面（懒加载）
├── components/             应用级组件（Sidebar, TitleBar, Toast…）
├── hooks/                  useTheme · usePythonBridge · useMouseGlow · useActivityLog
├── contexts/               Theme · Language · Toast · Confirm
├── types/                  完整 TypeScript 接口定义
└── utils/                  动画工具函数
```

---

##  快速开始

### 前提

- **Windows 11**（Windows 10 可运行但部分效果受限）
- **Node.js 22+**
- **Python 3.13** + 依赖

```bash
# 安装 Python 依赖
pip install pygame psutil mutagen Pillow

# 安装 Node 依赖
npm install

# 启动开发环境
npm run dev

# 生产构建
npm run build
```

### 下载

前往 [Releases](https://github.com/YOU5A/Codes-Suite/releases) 获取安装版或便携版。

---

##  设计哲学

1. **系统能力 × 消费级体验** — 注册表编辑不需要看起来像注册表编辑器
2. **材质即语言** — 模糊深度传递视觉层级，不需要多余的边框和阴影
3. **动效有意义** — Spring 动画不是装饰，是反馈系统的一部分
4. **主题是基础设施** — 8 套主题共用一套语义令牌，新组件自动适配

---

##  协作

AI Agent 协作请先阅读 [AGENTS.md](./AGENTS.md)，包含完整的保护规则、编码约定和项目上下文。

---

<p align="center">
  <sub>Crafted with ❤️ by <a href="https://github.com/YOU5A">YOU5A</a></sub>
</p>