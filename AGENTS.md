# AGENTS.md — Codes Suite

**项目名称:** Codes Suite
**作者:** Y0USA
**GitHub:** https://github.com/YOU5A/
**技术栈:** Electron 42+ / React 19 / TypeScript 6 / Vite 8 / Tailwind CSS 4 / Framer Motion 12 / Embedded Python 3.13 (Bridge)
**语言:** 中文（界面默认），代码注释英文

---

## 🔒 绝对保护规则

### 禁止修改的文件

`resources/` 下三个 `.pyw` 文件的**核心业务逻辑**绝对禁止修改：

- `resources/Win32PrioritySeparation.pyw` — 注册表读写、备份管理、值格式化、管理员检查
- `resources/AppCpuPriorityTools.pyw` — IFEO 注册表操作、导入导出
- `resources/File_Music.pyw` — 音频标签处理、封面管理、播放器、文件扫描

具体禁止修改的逻辑：注册表逻辑、音乐标签逻辑、封面处理逻辑、播放器逻辑（AudioPlayer）、CPU/IO 优先级逻辑、备份逻辑、导入导出逻辑、管理员权限逻辑。

三个 `.pyw` 的 Tkinter UI 部分允许在新页面中不加载，但**不允许删除原有代码**。

### 禁止的操作

- ❌ `subprocess.Popen()` 启动外部 Python 进程执行工具
- ❌ `os.startfile()` / `ShellExecute()` 启动外部程序
- ❌ 创建独立窗口运行 `.pyw` 文件
- ❌ 点击按钮后启动外部程序
- ❌ 生成独立的 `.exe`
- ❌ 重写/复制已有业务逻辑
- ❌ 在前端直接导入 Python 代码
- ❌ 通过子进程启动独立的 `.pyw` 文件

### 文件删除安全规则

- **禁止批量删除文件或目录**
- 禁止使用：`del /s`、`rd /s`、`rmdir /s`、`Remove-Item -Recurse`、`rm -rf`
- 删除文件时只能一次删除一个**明确路径**的文件
- 如果任务需要批量删除文件，必须停止并向用户请求

### 受保护目录（禁止删除）

以下目录禁止删除：`resources/`、`data/`、`node_modules/`、`bridge/`、`build-support/`、`dist/`、`dist-electron/`

---

## 编码规范

- 所有文本文件统一使用 **UTF-8 without BOM** 编码
- 不要创建带 BOM 的文件
- 修改文件时保持原文件的编码格式，不额外添加 BOM
- Python 读取文本文件时使用 `encoding='utf-8'` 或 `encoding='utf-8-sig'`
- 编写包含中文的代码时**不要使用 PowerShell**（用 cmd 或直接写文件）
- TypeScript/TSX：严格模式，完整类型注解
- React：函数式组件 + Hooks，禁止 class 组件
- CSS：Tailwind 工具类 + CSS 自定义变量
- 遵循 SOLID 原则，避免重复代码

---

## 项目结构

```
Codes Suite
├── electron/                    — Electron 主进程层
│   ├── main.js                  — 主进程：无边框窗口、IPC、系统托盘、管理员提升、自定义协议
│   ├── preload.js               — 预加载脚本：contextBridge 暴露 electronAPI（window/python/dialog/shell/app）
│   └── python-bridge.js         — PythonBridge 类：spawn 子进程、JSON-RPC over stdin/stdout、30s 超时、自动重连
│
├── src/                         — React 前端
│   ├── main.tsx                 — React 入口，挂载 #root
│   ├── App.tsx                  — 根组件：路由、Provider 层级（Toast > Confirm > Language）、页面切换（Framer Motion AnimatePresence）
│   ├── vite-env.d.ts            — Vite 类型声明
│   ├── components/              — 可复用 UI 组件
│   │   ├── Sidebar.tsx          — 侧边栏导航（6 页面 + 版本号）
│   │   ├── TitleBar.tsx         — 标题栏（拖拽 + 最小化/最大化/关闭）
│   │   ├── GlassCard.tsx        — 毛玻璃卡片（入场动画：opacity + y）
│   │   ├── Toast.tsx            — Toast 通知容器（右上角，spring 动画）
│   │   └── ConfirmDialog.tsx    — 确认对话框（模态，支持 danger 模式）
│   ├── pages/                   — 六大功能页面
│   │   ├── Dashboard.tsx        — 仪表盘：系统信息 + 快捷入口 + 操作历史 + 最近备份（328 行）
│   │   ├── Win32Priority.tsx    — Win32 优先级：注册表读写 + 预设表格 + 备份管理（438 行）
│   │   ├── AppCpuPriority.tsx   — 应用 CPU 优先级：CRUD + 导入导出 + 自定义下拉（549 行）
│   │   ├── MusicManager.tsx     — 音乐管理器：扫描/标签编辑/封面管理/播放器栏（568 行）
│   │   ├── BackupCenter.tsx     — 备份中心：查看/恢复/删除/导出（180 行）
│   │   └── Settings.tsx         — 设置：主题/外观/窗口行为/音乐/界面/语言/关于（550 行）
│   ├── hooks/                   — 自定义 Hooks
│   │   ├── useTheme.ts          — 主题系统：8 主题 + localStorage 持久化 + CSS 变量注入
│   │   ├── usePythonBridge.ts   — Python 桥封装：call/openFolder/openFile/saveFile
│   │   └── useActivityLog.ts    — 操作日志：localStorage 记录，最多 20 条
│   ├── contexts/                — React Context
│   │   ├── LanguageContext.tsx   — 语言切换（zh/en），同步到 Python config.set
│   │   ├── ToastContext.tsx     — Toast 通知状态管理（showToast API，4 类型：success/error/warning/info）
│   │   └── ConfirmContext.tsx   — 确认对话框 Promise 化 API（confirm() → boolean，支持 danger 模式）
│   ├── types/
│   │   └── index.ts             — 全局类型定义（SystemInfo, RegistryValue, PriorityRule, MusicMetadata, BackupEntry, PlaybackState, Theme, Language, Page, AppSettings, ElectronAPI）
│   ├── utils/
│   │   └── animations.ts        — 动画常量（EASE_OUT, getAnimDuration, getMicroDuration, getCssTransitionValues）
│   └── styles/
│       └── globals.css          — Tailwind 入口 + 28+ CSS 变量/主题（8 套）+ 通用组件类
│
├── bridge/                      — Python Bridge 层
│   ├── server.py                — JSON-RPC 服务器：importlib 动态导入三个 .pyw，暴露 34 个 RPC 方法
│   ├── config.json              — 桥层语言配置 {"language": "zh"}
│   └── __pycache__/             — Python 缓存
│
├── resources/                   — Python 业务模块（⚠️ 禁止修改核心逻辑）
│   ├── Win32PrioritySeparation.pyw — RegistryManager, BackupManager, ValueFormatter, AdminChecker
│   ├── AppCpuPriorityTools.pyw     — IFEO 注册表操作，导入导出
│   ├── File_Music.pyw              — AudioFileProcessor, AudioPlayer, FileUtils
│   └── __pycache__/                — Python 缓存
│
├── data/
│   └── config.json              — 共享配置 {"language": "zh", "musicVolume": 11}
│
├── build-support/
│   └── embed-python/
│       └── venv/                — 嵌入式 Python 3.13 虚拟环境（pygame 2.6.1, psutil 7.2.2, mutagen 1.47.0, Pillow 12.2.0）
│
├── public/
│   ├── icon.ico                 — 应用图标（Vite 静态资源）
│   └── icon.png                 — 应用图标 PNG
│
├── icon.ico                     — 应用图标（Electron 打包用）
├── icon.png                     — 应用图标 PNG（根目录复本）
├── index.html                   — Vite 入口 HTML
├── package.json                 — npm 依赖 + electron-builder 配置（portable target）
├── package-lock.json            — 依赖锁
├── vite.config.ts               — Vite 配置（React + Tailwind 插件，@ 别名 → src/，strictPort 5173）
├── tsconfig.json                — TypeScript 配置（前端，bundler 模式，ES2022，strict）
├── tsconfig.electron.json       — TypeScript 配置（Electron 层，commonjs 模式，ES2022）
├── .patch1.diff                 — 临时补丁文件
└── temp_patch.txt               — 临时文件
```

---

## 正确架构

### 通信流程

```
React 页面 → IPC (invoke) → Electron main.js → PythonBridge.call()
  → spawn("python", ["bridge/server.py"]) → stdin JSON-RPC → stdout JSON
  → importlib 动态导入 resources/*.pyw → 调用业务类/函数 → 返回结果
```

### 关键原则

- **必须**通过 Python Bridge（`bridge/server.py`）间接导入源码，使用 `importlib.util.spec_from_file_location()` 动态加载
- 前端通过 `window.electronAPI.python.call(method, params)` 调用后端
- **绝不**启动外部 `.pyw`，**绝不**启动额外 `.exe`，**绝不**重写已有业务逻辑
- 优先复用顺序：已有代码 > 已有类 > 已有函数 > 已有模块 > 扩展

### Electron 主进程特性（`electron/main.js`）

- 无边框窗口（`frame: false`, `transparent: true`）
- 透明背景 + 亚克力材质（`setBackgroundMaterial("acrylic")`）+ Vibrancy
- 自定义 GPU 缓存路径（`app.setPath('userData', ...)` 避免权限问题）
- 自定义协议 `codes-suite:///` 用于加载本地文件
- 系统托盘（右键：Show/Quit，单击恢复/聚焦）
- 管理员自动提升（`net session` 检测 → `powershell Start-Process -Verb RunAs`）
- IPC 通道：`window:*`（minimize/maximize/close/isMaximized/setOpacity/getPosition/getSize/setPosition）、`python:*`（call/status）、`dialog:*`（openFolder/openFile/saveFile）、`shell:*`（openPath/openExternal）、`app:*`（getPath）

### PythonBridge 类（`electron/python-bridge.js`）

- spawn Python 子进程，JSON-RPC over stdin/stdout
- 30 秒超时，断线自动重连（2 秒延迟）
- 可配置 Python 路径（`PYTHON_PATH` 环境变量），默认 `python`
- `__shutdown__` 信号优雅退出
- `processBuffer()` 逐行解析 JSON 响应，按请求 ID 匹配 Promise

---

## 允许修改的范围

仅允许修改：

| 层 | 允许修改的内容 |
|---|---|
| `src/` | 前端 React 代码（UI 层、页面布局、视觉设计、动画、主题、导航、状态管理） |
| `bridge/server.py` | 添加/调整 RPC 方法（不修改已有业务逻辑） |
| `electron/` | 窗口配置、IPC 通道 |
| `data/config.json` | 通过 `config.set` RPC 修改 |

---

## Bridge RPC 方法（34 个）

### 系统信息
| 方法 | 说明 |
|---|---|
| `system.info` | CPU/内存/磁盘/Windows 版本/主机名/管理员状态 |

### 注册表操作
| 方法 | 说明 |
|---|---|
| `registry.read` | 读取 Win32PrioritySeparation 值（含 decimal/hex/binary 格式化） |
| `registry.write` | 写入值（需管理员权限） |
| `registry.backup` | 创建备份到 `C:\CodesSuite\backups` |

### 管理员
| 方法 | 说明 |
|---|---|
| `admin.check` | 检查管理员状态 |
| `admin.restart` | 返回管理员权限需求提示 |

### 应用优先级规则
| 方法 | 说明 |
|---|---|
| `priority.list` | 列出所有 IFEO 规则 |
| `priority.add` | 新增规则（name, cpu_priority, io_priority） |
| `priority.edit` | 编辑规则 |
| `priority.delete` | 删除规则 |
| `priority.export` | 导出为 JSON |
| `priority.import_config` | 从 JSON 导入 |

### 音乐管理
| 方法 | 说明 |
|---|---|
| `music.scan` | 扫描目录（MP3/FLAC/OGG/M4A/WAV/OPUS） |
| `music.get_metadata` | 获取元数据（标题/艺术家/专辑/年份/流派/音轨/封面） |
| `music.save_tags` | 保存标签 |
| `music.extract_cover` | 提取封面（base64） |
| `music.apply_cover` | 应用封面 |
| `music.remove_cover` | 移除封面 |
| `music.rename` | 批量重命名 |
| `music.play` / `music.pause` / `music.stop` | 播放控制 |
| `music.get_position` | 获取播放位置 + 状态 |
| `music.seek` | 定位 |
| `music.set_volume` | 设置音量 (0-100) |
| `music.get_current_file` | 当前播放文件路径 |
| `music.read_cover_file` | 读取封面文件返回 base64 |

### 备份管理
| 方法 | 说明 |
|---|---|
| `backup.list` | 列出所有备份 |
| `backup.dir` | 备份目录路径 |
| `backup.export` | 导出到指定位置 |
| `backup.restore` | 从备份恢复 |
| `backup.delete` | 删除备份 |
| `backup.clear_all` | 清除所有备份 |

### 配置
| 方法 | 说明 |
|---|---|
| `config.get` | 获取配置 |
| `config.set` | 设置配置（自动同步三个 Python 模块的 `set_language()`） |

---

## 页面架构

单窗口，六大页面，路由通过 `localStorage("codes-suite-page")` 持久化：

| 页面 | 路由 Key | 数据来源 |
|---|---|---|
| Dashboard | `dashboard` | `system.info`（每 2.5s 轮询）+ 操作历史 + 最近备份 |
| Win32 Priority | `win32priority` | `registry.*` + `backup.*`（RegistryManager, BackupManager） |
| App CPU Priority | `appcpupriority` | `priority.*`（IFEO 注册表操作） |
| Music Manager | `musicmanager` | `music.*`（AudioFileProcessor, AudioPlayer） |
| Backup Center | `backupcenter` | `backup.*`（`C:\CodesSuite\backups`） |
| Settings | `settings` | 前端 localStorage 设置 + `config.*` |

---

## 配置系统

### Python 层共享配置（`data/config.json`）

```json
{
  "language": "zh",
  "musicVolume": 10
}
```

通过 `config.get` / `config.set` RPC 读写，修改 `language` 时自动同步三个 Python 模块。

### Bridge 层语言配置（`bridge/config.json`）

```json
{
  "language": "zh"
}
```

### 前端设置（`localStorage("codes-suite-settings")`）

```typescript
interface AppSettings {
  windowOpacity: number;           // 0-100，默认 100
  borderRadius: number;            // 0-32px，默认 20
  animationSpeed: "normal" | "fast" | "off";  // 默认 "fast"
  rememberSize: boolean;           // 默认 true
  rememberPosition: boolean;       // 默认 true
  sidebarWidth: number;            // 180-320px，默认 240
  fontScale: number;               // 80-150，默认 120
  compactMode: boolean;            // 默认 false
  theme: Theme;                    // 8 套主题，默认 "auto"
}
```

主题通过 `localStorage("codes-suite-theme")` 单独持久化。语言通过 `localStorage("codes-suite-lang")` 单独持久化。

---

## 主题系统

8 套主题，通过 CSS 自定义变量（28+ 变量）注入 `document.documentElement`：

| 主题 | 选择器 | 类型 | 强调色 |
|---|---|---|---|
| 浅色 | `[data-theme="light"]` / `[data-theme-name="light"]` | 浅色 | `#0071e3` |
| 深色 | `[data-theme="dark"]` | 深色 | `#0a84ff` |
| 自动 | 跟随系统 `prefers-color-scheme` | 自适应 | 跟随 |
| 石墨 | `[data-theme-name="graphite"]` | 浅色 | `#5856d6` |
| 午夜 | `[data-theme-name="midnight"]` | 深色 | `#6366f1` |
| 海洋 | `[data-theme-name="ocean"]` | 浅色 | `#0066cc` |
| 翡翠 | `[data-theme-name="emerald"]` | 浅色 | `#059669` |
| 深红 | `[data-theme-name="crimson"]` | 深色 | `#f43f5e` |

变量层级：背景（primary/secondary/tertiary/elevated/glass）、边框（color/strong）、文字（primary/secondary/tertiary）、强调色（accent/accent-hover/accent-bg/accent-rgb）、语义色（success/warning/danger）、阴影（sm/md/lg/xl）、滑块轨道（slider-track）。

前端设置中可通过 `toggleTheme()` 循环切换所有 8 种主题。

---

## UI 设计规范

- Apple Liquid Glass / Glass Morphism / Fluent Motion
- 无边框窗口（`frame: false`）
- 圆角 20px（`--radius`，可调）
- 毛玻璃 + 亚克力（`setBackgroundMaterial("acrylic")`）+ Vibrancy
- 背景模糊（`backdrop-filter: blur(15-20px)`）
- 通用 CSS 类：`.glass-card`、`.glass-panel`、`.btn-primary`、`.btn-secondary`、`.btn-danger`、`.btn-icon`、`.input-field`
- 字体栈：`-apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft YaHei", "PingFang SC", sans-serif`

### 动画

- 页面切换：Framer Motion AnimatePresence（opacity fade），duration 由 `getAnimDuration()` 控制
- 按钮交互：`scale(1.02)` hover、`scale(0.98)` active，transition `var(--transition-fast)` ease
- GlassCard hover：背景提升 + 阴影增强 + 边框加粗
- Toast 入场：opacity + x + scale spring 动画，300ms 退出
- 确认对话框：opacity + scale 动画
- 动画速度三档：normal / fast / off（通过 `utils/animations.ts` 统一管理，CSS 变量 `--transition-fast/normal/slow` 注入）
- 鼠标拖拽标题栏移动窗口

---

## TypeScript 类型

核心类型定义在 `src/types/index.ts`：

- `SystemInfo` — CPU/内存/磁盘/系统信息（16 字段）
- `RegistryValue` — 注册表值（decimal/hex/binary）
- `PriorityRule` — 应用优先级规则（name/cpu_priority/io_priority）
- `MusicMetadata` — 音频元数据（title/artist/album/year/genre/track/has_cover）
- `BackupEntry` — 备份条目（filename/filepath/date/time/decimal/hex/date_obj/module/size）
- `PlaybackState` — 播放状态（position_ms/length_ms/is_playing/is_paused/is_open）
- `Theme` — 8 种主题类型
- `Language` — `"zh" | "en"`
- `Page` — 6 种页面路由
- `AppSettings` — 前端设置接口（9 字段）
- `ElectronAPI` — 完整 API 类型声明（window/python/dialog/shell/app）

> 注意：`ElectronAPI.window.setMinimizable` 在类型中声明但主进程未实现。

---

## 开发命令

```bash
npm run dev          # Vite + Electron 并行启动
npm run build        # Vite 构建 + electron-builder 打包（portable target）
npm run vite:dev     # 仅 Vite 开发服务器（localhost:5173，strictPort）
npm run electron:dev # 仅 Electron
```

Python 嵌入式环境：`build-support/embed-python/venv/` — Python 3.13 + pygame 2.6.1 + psutil 7.2.2 + mutagen 1.47.0 + Pillow 12.2.0

---

## 非项目文件

| 路径 | 说明 |
|---|---|
| `node_modules/` | npm 依赖 |
| `dist/` | Vite 构建产物（含 `icon.ico`、`icon.png`） |
| `dist-electron/` | electron-builder 输出 |
| `bridge/__pycache__/` | Python 字节码缓存 |
| `resources/__pycache__/` | Python 字节码缓存 |
| `build-support/` | 嵌入式 Python 虚拟环境及其依赖 |
| `.patch1.diff` | 临时补丁 |
| `temp_patch.txt` | 临时文件 |
| `main.js` | 根目录游离文件（`electron/main.js`的旧副本），已在 .gitignore 中 |

---

## 管理员权限

权限检查链路：

1. `electron/main.js` → `ensureAdmin()`：`net session` 检测，不足时通过 `spawnSync` 调用 PowerShell `Start-Process -Verb RunAs` 提升（开发模式附带 `-ArgumentList '.' -WorkingDirectory`）
2. `resources/Win32PrioritySeparation.pyw` → `AdminChecker.is_admin()`：业务层权限检查
3. `bridge/server.py` → `handle_admin_check()` / `handle_admin_restart()`：RPC 层权限检查

**不得移除、不得弱化、不得替换。**