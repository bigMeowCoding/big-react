# AGENTS 项目说明书

## 项目概述

- 项目名：`big-react`
- 目标：以分包形式实现 React 核心能力，并提供演示与调试入口。
- 技术栈：JavaScript、Rollup、Vitest、ESLint、Prettier、pnpm workspace。

## 目录结构

- `packages/react`：React 核心包。
- `packages/react-dom`：DOM 渲染相关实现。
- `packages/react-reconciler`：协调器相关实现。
- `packages/shared`：跨包共享能力。
- `packages/demos`：本地演示工程（用于开发和验证）。
- `.ai/architecture.md`：项目技术架构说明文档（分层、流程、边界）。
- `.ai/specs/`：功能规格文档（如 `fragment.md`、`lane-mode.md`、`use-effect.md`）。

## 常用命令

- 安装依赖：`pnpm install`
- 代码检查：`pnpm lint`
- 单元测试：`pnpm test`（监听模式：`pnpm test:watch`）
- 构建开发产物：`pnpm build:dev`
- 演示工程开发（在 `packages/demos`）：`pnpm dev`

## Commit 规范

- 提交信息必须使用中文，至少在 `subject` 中包含中文内容。
- 推荐格式：`type(scope): 中文描述`，例如：`feat(react): 实现 jsx 工厂函数`。
- 该规范作为团队约定执行，不额外增加提交钩子强制拦截。

## Agent 协作约定

- 项目技术架构说明统一维护在 `.ai/architecture.md`，与 `AGENTS.md` 保持一致更新。
- 功能设计与验收标准维护在 `.ai/specs/` 对应 spec 文档。
- 全局性发现、跨模块约束、可作为项目规范的内容沉淀在 `AGENTS.md`。
- 记录保持简短、可追溯、可执行，优先使用要点式表达。

## 项目发现与约定

### 语言与模块

- 项目统一使用 **JavaScript**（无 TypeScript）；ESM 导入路径需显式包含 `.js` 扩展名，否则 ESLint 模块解析会报错。
- 包依赖链路：`demos → react-dom → react-reconciler → shared`；`react` 提供 JSX 工厂与元素结构，`react-dom` 通过 `createRoot().render()` 驱动渲染。

### demos 工程

- 入口文件采用 **`.jsx`** 命名（如 `src/main.jsx`），遵循 Vite 默认约定；不在 Vite 中放宽 `.js` 的 JSX 解析规则。

### 架构边界

- **Host Config** 属于 `packages/react-dom` 的 L4 宿主适配层（`src/hostConfig.js`），L2 渲染入口与 L4 DOM 操作同属 `react-dom` 包；reconciler 通过 `react-dom/src/hostConfig` 调用宿主能力。

### 测试

- 根目录 `vitest.config.js`，alias 与 `packages/demos/vite.config.js` 一致。
- 测试文件约定：`packages/**/__tests__/**/*.test.js`。
- 纯逻辑用 Vitest；涉及 DOM 与用户可见行为时辅以 `packages/demos` 手工验收。

### 实现注意

- 调试日志（如 `workLoop`、`completeWork`）仍较多，按里程碑逐步收敛，避免干扰 demos 验证输出。
- workspace 存在 `react-dom ↔ react-reconciler` 循环依赖（pnpm 可解析，改动时注意 import 方向）。
