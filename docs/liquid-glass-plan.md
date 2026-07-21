Codes-Suite Liquid Glass UI Rewrite Agent Manual
项目目标

你正在重构项目：

https://github.com/YOU5A/Codes-Suite

目标：

将整个 UI 系统升级为：

Apple iOS 26 / macOS Tahoe / visionOS 风格 Liquid Glass Interface

不是局部美化，而是建立完整 Design System。

最终效果：

半透明玻璃层
动态背景透射
光线折射
柔和阴影
Superellipse 圆角
流体动画
深浅模式自适应
Apple 风格空间层级
Phase 0 - 项目分析阶段
Agent Task

首先不要修改代码。

执行：

分析项目结构

输出：

/src
/components
/pages
/hooks
/styles
/assets

关系图。

判断：
React / Vue / Next / Vite
CSS方案
UI组件库
状态管理
动画方案
找出：

所有：

Button
Card
Modal
Sidebar
Navbar
Input
Dropdown
Table
Dialog

生成：

UI Migration Map

格式：

旧组件	位置	替换方案
Card	xxx	LiquidGlassCard
Button	xxx	GlassButton

完成后停止。

Phase 1 - 建立 Liquid Glass Design System

创建：

src/design-system/

结构：

design-system
│
├── theme
│   ├── colors.ts
│   ├── shadows.ts
│   ├── materials.ts
│
├── glass
│   ├── LiquidGlass.tsx
│   ├── GlassCard.tsx
│   ├── GlassPanel.tsx
│
├── components
│   ├── GlassButton.tsx
│   ├── GlassInput.tsx
│   ├── GlassModal.tsx
│
└── index.ts
Phase 2 - 安装核心依赖

优先：

npm install liquid-glass-react

来源：

https://github.com/rdev/liquid-glass-react

用途：

核心材质。

封装：

不要直接使用：

<LiquidGlass>

必须包装：

<GlassSurface>
    content
</GlassSurface>

原因：

未来替换实现。

Phase 3 - 建立 Material System

创建：

materials.ts

定义：

Glass Ultra Thin

用途：

Toolbar

参数：

opacity:
0.25

blur:
30px

saturation:
180%
Glass Regular

用途：

Cards

opacity:
0.35

blur:
40px
Glass Thick

用途：

Modal

opacity:
0.55

blur:
60px
Phase 4 - 基础组件重写
Button

旧：

<button>

替换：

GlassButton

要求：

hover 光晕
点击压缩
边缘反光
spring animation

状态：

Normal

↓

Hover

↓

Pressed

动画：

spring physics
Card

所有：

.card
.panel
.container

替换：

GlassCard

要求：

拥有：

backdrop blur
refraction
subtle border
dynamic highlight
Sidebar

重构：

Apple macOS Sidebar

要求：

浮动
半透明
内容漂浮感

结构：

background

↓

glass sidebar

↓

navigation items

↓

active liquid pill
Phase 5 - 页面迁移

逐页面：

禁止一次全部修改。

顺序：

Dashboard

↓

Main Pages

↓

Settings

↓

Authentication

↓

Utility Pages

每完成一个页面：

运行：

npm run build

确认。

Phase 6 - 动态背景系统

创建：

BackgroundLayer

支持：

gradient mesh
noise texture
moving light

效果：

玻璃下面必须有内容。

不要：

纯白背景 + blur。

Phase 7 - Animation System

统一：

安装：

framer-motion

建立：

motion.ts

定义：

glassSpring

glassFade

glassScale

liquidHover

禁止：

组件内部随意写 animation。

Phase 8 - Dark Mode

实现：

Apple Dark Liquid Glass

要求：

Light:

white glass

Dark:

black glass

自动：

prefers-color-scheme
Phase 9 - Performance Optimization

检查：

禁止：

所有组件开启 WebGL。

规则：

High Level:

Modal
Hero
Landing

允许。

普通：

Table
List
Button

使用 CSS glass。

Phase 10 - 最终 UI Audit

Agent 必须检查：

Apple Design Checklist
Transparency

是否存在玻璃层？

Depth

是否有空间层级？

Motion

是否有自然动画？

Adaptivity

是否支持：

Light/Dark

Consistency

所有组件是否来自：

design-system
Agent 工作规则
Rule 1

禁止：

直接修改大量页面。

必须：

先建立组件。

Rule 2

禁止：

复制 CSS。

所有样式进入：

design-system
Rule 3

每完成一个 Phase：

输出：

Completed:
- files changed
- components created
- screenshots needed
- next step
Rule 4

如果发现旧 UI 架构阻碍：

不要绕过去。

提出：

Architecture Refactor Proposal
推荐额外研究库

可以让 Agent 调研：

rdev/liquid-glass-react

核心 Liquid Glass。

AndrewPrifer/liquid-dom

DOM级玻璃效果。

framer-motion

Apple spring 动画。

radix-ui

无样式基础组件。

lucide-react

替换旧 icon。

最终目标结构

最终：

src

├── design-system

│
├── components

│   ├── GlassButton

│   ├── GlassCard

│   ├── GlassModal

│
├── layouts

│   └── LiquidLayout

│
├── pages

│
└── themes


这个手册可以直接作为 Cursor / Claude Code / Devin / OpenHands 的长期任务 Prompt 使用。建议执行顺序严格按照 Phase 0 → Phase 10，不要让 Agent 一次性重写整个项目，否则 Liquid Glass 会变成「套了一层 blur 的普通 UI」。