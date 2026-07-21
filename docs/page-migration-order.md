# Codes-Suite Liquid Glass Migration — Page Order

> 分析日期: 2026-07-22  
> 项目: Codes-Suite v1.1.0  
> 框架: Electron + React + Python + Framer Motion  
> 设计系统: `src/design-system` (GlassSurface, GlassCard, GlassPanel, GlassButton, GlassInput, GlassModal)

---

## 评分体系

每条页面按三个维度评分 (1–5, 5 为最高):

| 维度 | 说明 |
|------|------|
| **视觉重要性** | 用户可见度、是否为入口页面、UI 复杂度 |
| **迁移难度** | 代码行数、内联样式密度、自定义组件数量 |
| **业务风险** | 是否直接操作注册表/文件、是否涉及关键数据流 |

---

## 页面分析汇总

### 1. BackupCenter — `src/pages/BackupCenter.tsx`

| 维度 | 评分 | 说明 |
|------|------|------|
| 视觉重要性 | ⭐⭐ (2) | 简单列表页，视觉层次扁平 |
| 迁移难度 | ⭐ (1) | 最短页面 (~110 行 UI)，仅备份列表 + 操作按钮 |
| 业务风险 | ⭐⭐ (2) | 备份恢复/删除操作注册表，但有 confirm 保护 |

**当前状态:**
- 使用 `GlassCard` (已桥接到 design-system)
- 使用 `motion` 动画
- 依赖: `useLanguage`, `useToast`, `useConfirm`, `useTheme`
- 内联样式较多但结构简单

---

### 2. Dashboard — `src/pages/Dashboard.tsx`

| 维度 | 评分 | 说明 |
|------|------|------|
| 视觉重要性 | ⭐⭐⭐⭐⭐ (5) | 应用首页，用户第一印象，包含系统状态、快捷入口、活动历史 |
| 迁移难度 | ⭐⭐⭐ (3) | 328 行，四个区域 (统计卡片、快捷入口、活动历史、备份列表) |
| 业务风险 | ⭐⭐ (2) | 只读 API 调用 (system.info, backup.list)，不修改数据 |

**当前状态:**
- 使用 `GlassCard`，`motion`
- 使用 `useTheme`, `useLanguage`, `useActivityLog`
- 四个视觉区域各有不同的布局需求
- 统计卡片使用硬编码颜色 (`var(--accent-bg)` 等)
- 快捷入口卡片带 hover 导航交互

---

### 3. Settings — `src/pages/Settings.tsx`

| 维度 | 评分 | 说明 |
|------|------|------|
| 视觉重要性 | ⭐⭐⭐⭐ (4) | 高频访问，包含外观/主题/窗口/语言/关于等完整设置 |
| 迁移难度 | ⭐⭐⭐⭐ (4) | 551 行，控制类型最丰富 (Toggle, 按钮组, 下拉, 滑块替代, 颜色网格) |
| 业务风险 | ⭐⭐⭐ (3) | 修改全局设置 (主题/语言/窗口行为)，影响整个应用体验 |

**当前状态:**
- 使用 `GlassCard`, `motion`, `createPortal`
- 自定义 `Toggle` 组件
- 自定义颜色选择器 (grid + portal dropdown)
- 滑块替代 UI (三按钮组)
- 大量内联样式布局段

---

### 4. Win32Priority — `src/pages/Win32Priority.tsx`

| 维度 | 评分 | 说明 |
|------|------|------|
| 视觉重要性 | ⭐⭐⭐⭐ (4) | 核心功能页面，预设表格 + 数值显示 + 备份管理 |
| 迁移难度 | ⭐⭐⭐ (3) | 439 行，预设网格布局、注册表值展示、自定义输入面板 |
| 业务风险 | ⭐⭐⭐⭐ (4) | **直接修改 Windows 注册表** `PrioritySeparation`，需管理员权限，重启生效 |

**当前状态:**
- 使用 `GlassCard`, `motion`
- 使用 `useTheme`, `useLanguage`, `useToast`, `useConfirm`, `recordActivity`
- 预设卡片网格 (12 个预设项)
- 当前值仪表盘 (十进制/十六进制/二进制)
- 备份管理子区域 (创建/恢复/删除/清空)

---

### 5. AppCpuPriority — `src/pages/AppCpuPriority.tsx`

| 维度 | 评分 | 说明 |
|------|------|------|
| 视觉重要性 | ⭐⭐⭐ (3) | 应用管理页，规则列表 + CRUD 模态框 |
| 迁移难度 | ⭐⭐⭐ (3) | 549 行，自定义 SelectDropdown 组件、模态对话框、文件导入导出 |
| 业务风险 | ⭐⭐⭐⭐ (4) | **直接修改 Windows 注册表** (Image File Execution Options)，需管理员权限 |

**当前状态:**
- 使用 `GlassCard`, `motion`, `AnimatePresence`
- 自定义 `SelectDropdown` (玻璃风格下拉)
- 模态对话框 (添加/编辑规则)
- I/O 优先级开关面板
- 规则列表 (编辑/删除)
- 导入/导出 JSON 配置

---

### 6. MusicManager — `src/pages/MusicManager.tsx`

| 维度 | 评分 | 说明 |
|------|------|------|
| 视觉重要性 | ⭐⭐⭐⭐⭐ (5) | 最复杂的视觉页面：文件浏览器 + 标签编辑器 + 封面显示 + 播放控制栏 |
| 迁移难度 | ⭐⭐⭐⭐⭐ (5) | 568 行，多面板布局、自定义播放器、进度条、音量滑块、文件列表 |
| 业务风险 | ⭐⭐⭐ (3) | 标签编辑 → 修改用户音频文件、重命名操作 → 修改文件系统 |

**当前状态:**
- 使用 `GlassCard`, `motion`
- 三栏布局 (文件列表 + 元数据编辑 + 封面区域)
- 自定义播放器栏 (已有玻璃效果: `backdropFilter: "blur(40px) saturate(180%)"`)
- 自定义进度条 (CSS transition)
- 与 Python 后端频繁通信 (scan/read/write/playback)

---

## 综合排名

按优先级排序 (先迁移的排前面):

| # | 页面 | 视觉 | 难度 | 风险 | 理由 |
|---|------|------|------|------|------|
| **P1** | BackupCenter | ⭐⭐ | ⭐ | ⭐⭐ | 最简单页面，快速建立迁移模板和信心 |
| **P2** | Dashboard | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | 最高视觉优先级，用户第一印象，只读 API 低风险 |
| **P3** | Win32Priority | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | 核心功能，中等复杂度，完成后可复用模式到 AppCpuPriority |
| **P4** | AppCpuPriority | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | 与 Win32 相似模式，可复用 SelectDropdown 改造方案 |
| **P5** | Settings | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | 控件种类最多，需要设计系统支撑充足后再迁移 |
| **P6** | MusicManager | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | 最复杂页面，需要前面所有页面积累的组件和模式 |

---

## 迁移顺序路线图

```
Phase 1 ──► BackupCenter     (热身，建立模板)
Phase 2 ──► Dashboard        (高视觉价值，提升整体观感)
Phase 3 ──► Win32Priority    (核心功能，中等复杂度)
Phase 4 ──► AppCpuPriority   (复用 Phase 3 模式)
Phase 5 ──► Settings         (控件大全，设计系统压力测试)
Phase 6 ──► MusicManager     (终极挑战，多面板 + 播放器)
```

---

## 每阶段约束

- **只改 UI 层**: CSS / inline styles → design-system 组件
- **不动**: API 调用 (`window.electronAPI?.python.call`)、hooks、state、routing
- **每阶段结束**: 运行 `npm run build` 验证，报告结果
- **下一个阶段开始前**: STOP，等待确认

---

## 设计系统已有组件

迁移时可以直接使用的 design-system 组件:

| 组件 | 用途 |
|------|------|
| `GlassSurface` | 基础玻璃容器 (底层) |
| `GlassCard` | 卡片容器 (带 padding/圆角/阴影/hover) |
| `GlassPanel` | 全幅面板 (可滚动) |
| `GlassButton` | 按钮 (primary/secondary/danger/ghost + sm/md/lg) |
| `GlassInput` | 输入框 |
| `GlassModal` | 模态对话框 |
| `GlassLayout` | 根布局 (已在 App.tsx 中使用) |
| `GlassMain` | 主内容区 (已在 App.tsx 中使用) |

已有 **Materials**: `materials` 对象 (ultraThin, regular, thick, elevated)  
已有 **Animations**: `springDefault`, `springSnappy`, `springBouncy`, `hoverLift`, `cardVariants`, `modalVariants` 等  
已有 **Tokens**: `blurHierarchy`, `space`, `radii`, `colors`, `fontSizes`, `zLayers`

---

*文档由 Codex 自动生成。下一步：开始 Phase 1 — BackupCenter 迁移。*