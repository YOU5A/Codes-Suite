# Codes-Suite Liquid Glass Performance Audit

> Phase 6 — 2026-07-22

---

## 1. Executive Summary

全面审计了项目的 `backdrop-filter`、blur、Framer Motion 动画和视觉效果的渲染性能。共发现 **3 个高优先级** 和 **5 个中优先级** 问题。最主要的问题是 **按钮和输入框** 在大量重复场景中使用了 backdrop-filter blur，违反 Phase 6 规则。

---

## 2. Backdrop-Filter & Blur 使用总览

### 2.1 设计系统 (符合预期)

| 文件 | Tier | Blur | 合理性 |
|------|------|------|--------|
| `src/design-system/materials/materials.ts` | ultraThin | 8px | ✅ 最轻量级 |
| `src/design-system/materials/materials.ts` | regular | 20px | ✅ 标准卡片 |
| `src/design-system/materials/materials.ts` | thick | 40px | ✅ 主面板 |
| `src/design-system/materials/materials.ts` | elevated | 30px | ✅ 模态框 overlay |
| `src/design-system/components/GlassModal.tsx` | backdrop | 4px | ✅ 轻微背景模糊 |

### 2.2 组件内联 Blur

| 文件 | 位置 | Blur 值 | 风险评估 |
|------|------|---------|----------|
| `src/design-system/components/GlassButton.tsx:56` | secondary 变体 | 15px | 🔴 **高** — 每个按钮都渲染 blur |
| `src/design-system/components/GlassButton.tsx:83` | input 变体 | 8px | 🔴 **高** — 选择类按钮 |
| `src/design-system/components/GlassInput.tsx:37` | 所有输入框 | 8px | 🔴 **高** — 每个输入框都渲染 blur |
| `src/components/Toast.tsx:52` | Toast 容器 | 20px | 🟡 **中** — 可堆叠多个 Toast |
| `src/pages/AppCpuPriority.tsx:171` | 下拉菜单 | 20px | 🟡 **中** — 临时浮层 |
| `src/pages/AppCpuPriority.tsx:414` | 对话框遮罩 | 16px | ✅ 允许 (模态) |
| `src/pages/MusicManager.tsx:480` | 播放器面板 | 40px | ✅ 允许 (主面板) |
| `src/pages/Settings.tsx:228` | 下拉菜单 | 20px | 🟡 **中** — 临时浮层 |

### 2.3 CSS 遗留 (globals.css)

| 选择器 | Blur | 状态 |
|--------|------|------|
| `.glass-panel` | 20px | ⚠️ 遗留，已被 GlassPanel 替代 |
| `.glass-card` | 15px | ⚠️ 遗留，已被 GlassCard 替代 |

---

## 3. 动画渲染审计

### 3.1 页面级动画

| 组件 | 动画 | 性能影响 |
|------|------|----------|
| `App.tsx` → `pageTransition` | opacity + translateY + **filter:blur(2px)** | 🟡 filter blur 触发昂贵的 compositing |
| `GlassModal.tsx` → `glassPopIn` | scale + opacity + **filter:blur(6px)** | ✅ 允许 (模态) |

### 3.2 组件级动画

| 组件 | 动画预设 | 触发条件 | 性能影响 |
|------|----------|----------|----------|
| `GlassCard` | `glassEntrance` (spring + blur-in) | 每个卡片挂载 | 🟡 列表中的卡片同时播放多个 spring |
| `GlassCard` | `glassHover` / `glassLift` | hover/tap | ✅ 交互响应 |
| `GlassButton` | `whileHover` + `whileTap` (springSnappy) | hover/tap | ✅ 轻量 (无 blur) |
| `GlassInput` | `whileFocus` (glassFocusRing) | focus | ✅ 单次触发 |
| `Sidebar` | `whileTap` (springSnappy) | 点击 | ✅ 轻量 |
| `Toast` | AnimatePresence enter/exit | 出现/消失 | ✅ 单次动画 |

### 3.3 后台动画

| 组件 | 动画 | 性能影响 |
|------|------|----------|
| `GlassBackground` | 动态渐变光球 (animated=true) | 🟡 持续运行的 CSS 动画 |

---

## 4. 规则合规性检查

> **规则**: 重效果可以用于模态、主面板、Hero；列表、表格、重复组件中应避免。

| 位置 | 组件类型 | 效果 | 合规 |
|------|----------|------|------|
| Sidebar | 固定面板 | regular blur (20px) | ✅ 允许 |
| TitleBar | 固定面板 | ultraThin blur (8px) | ✅ 允许 |
| GlassModal | 模态 | elevated blur (30px) + pop-in | ✅ 允许 |
| MusicManager 播放器 | Hero 面板 | blur(40px) saturate(180%) | ✅ 允许 |
| AppCpuPriority 对话框 | 模态遮罩 | blur(16px) | ✅ 允许 |
| **GlassButton secondary** | **重复组件** | **blur(15px)** | 🔴 **违规** |
| **GlassButton input** | **重复组件** | **blur(8px)** | 🔴 **违规** |
| **GlassInput** | **重复组件** | **blur(8px)** | 🔴 **违规** |
| **Toast** | **重复组件** | **blur(20px)** | 🔴 **违规** |
| Dashboard statCards (.map) | 重复列表 | 5x blur(20px) + entrance | 🟡 边界 — 仅 5 个 |
| Dashboard quickLinks (.map) | 重复列表 | 4x blur(20px) + entrance + hover | 🟡 边界 — 仅 4 个 |
| Dashboard activity items | 表格行 | ❌ 无 blur (内容在 GlassCard 内) | ✅ |
| Settings 下拉 | 临时浮层 | blur(20px) | 🟡 可接受 (单次) |

---

## 5. 发现的问题 (按优先级)

### 🔴 P0 — 高风险

#### 5.1 GlassButton secondary 变体使用 backdrop-filter (blur 15px)
- **文件**: `src/design-system/components/GlassButton.tsx:56-57`
- **影响**: 应用中每个 secondary 按钮都渲染 backdrop-filter。设置页面、仪表板等地方有大量按钮。
- **建议**: 移除 backdrop-filter，使用半透明 `background: var(--bg-secondary)` 替代。视觉效果差异极小。

#### 5.2 GlassInput 所有输入框使用 backdrop-filter (blur 8px)
- **文件**: `src/design-system/components/GlassInput.tsx:37-38`
- **影响**: 每个文本输入框、选择框都渲染 backdrop-filter。设置页面有多个输入框。
- **建议**: 移除 backdrop-filter，保留 `background: var(--bg-tertiary)` 半透明背景。

#### 5.3 Toast 使用 backdrop-filter (blur 20px)
- **文件**: `src/components/Toast.tsx:52-53`
- **影响**: 多个 Toast 可能同时显示，每个都有 20px blur。
- **建议**: 将 blur 降至 8px 或移除，使用背景色透明度代替。

### 🟡 P1 — 中风险

#### 5.4 pageTransition 包含 filter: blur 动画
- **文件**: `src/design-system/animations/glass.ts` → `pageTransition`, `src/App.tsx`
- **影响**: 每次页面切换触发 `filter: blur(2px)` 的 CSS 过渡，在 Electron (Chromium) 中触发昂贵的 repaint。
- **建议**: 移除 `filter: blur()` 属性，仅保留 opacity + translateY。

#### 5.5 glassEntrance 包含 filter: blur 动画
- **文件**: `src/design-system/animations/glass.ts` → `glassEntrance`
- **影响**: 所有 GlassCard 挂载时播放 blur(4px)→blur(0px) 的 spring 动画。Dashboard 有 9 个卡片同时播放。
- **建议**: 考虑为列表中的卡片提供 `noAnimation` 默认值，或提供 `GlassCardList` 变体。

#### 5.6 GlassBackground 持续运行动画光球
- **文件**: `src/design-system/layouts/GlassBackground.tsx`
- **影响**: `animated` 默认 `true`，持续渲染 CSS 动画。
- **建议**: 考虑添加 `prefers-reduced-motion` 检测；或在设置中提供关闭选项。

### 🔵 P2 — 低风险 / 建议

#### 5.7 页面内联 blur 未使用设计系统
- **文件**: `AppCpuPriority.tsx` (L171, L414), `Settings.tsx` (L228)
- **影响**: 绕过设计系统的 blur token 层级，维护困难。但性能影响有限（临时浮层）。
- **建议**: 后续迁移到 GlassSurface 或设计系统组件。

#### 5.8 globals.css 遗留 .glass-panel / .glass-card
- **文件**: `src/styles/globals.css:217-225`
- **影响**: 如果这些 CSS 类仍被使用，则存在重复效果。需要确认是否还有引用。
- **建议**: 确认无引用后可移除。

---

## 6. 统计数据

| 指标 | 数值 |
|------|------|
| 设计系统文件数 | 16 |
| 使用 GlassSurface 的组件 | 3 (Sidebar, TitleBar, ConfirmDialog) |
| 使用 GlassCard 的页面 | 6 (全部页面) |
| 使用 GlassButton 的页面 | 1 (ConfirmDialog) |
| 使用 GlassInput 的页面 | 0 (刚创建，暂无引用) |
| 使用 GlassModal 的页面 | 1 (ConfirmDialog) |
| 内联 backdrop-filter 位置 (页面中) | 4 处 |
| 组件级 backdrop-filter 位置 | 4 处 (Button x2, Input, Toast) |
| Framer Motion import 文件数 | 13 |
| 重复渲染中的 Glass 效果 | 2 处 (Dashboard statCards, quickLinks) |
| 违反 "避免重复组件" 规则 | 3 处 (Button, Input, Toast) |

---

## 7. 建议修复优先级

1. **立即 (Phase 7)**: 移除 GlassButton + GlassInput 的 backdrop-filter
2. **立即 (Phase 7)**: 降低或移除 Toast 的 backdrop-filter
3. **下一阶段**: 从 pageTransition 和 glassEntrance 移除 filter:blur 动画
4. **后续**: 将页面内联 blur 迁移到设计系统
5. **后续**: 添加 `prefers-reduced-motion` 支持

---

## 8. 变更文件清单 (本阶段)

| 文件 | 操作 | 说明 |
|------|------|------|
| `docs/performance-report.md` | 新建 | 本报告 |

本阶段仅审计，未修改代码。修复将在后续阶段执行。

---

*Phase 6 complete. Ready for Phase 7.*