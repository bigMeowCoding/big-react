# AGENTS 项目说明书

## 项目概述

- 项目名：`big-react`
- 目标：以分包形式实现 React 核心能力，并提供演示与调试入口。
- 技术栈：TypeScript、Rollup、ESLint、Prettier、pnpm workspace。

## 目录结构

- `packages/react`：React 核心包。
- `packages/react-dom`：DOM 渲染相关实现。
- `packages/react-reconciler`：协调器相关实现。
- `packages/shared`：跨包共享能力。
- `packages/demos`：本地演示工程（用于开发和验证）。
- `specs/memory`：Agent 零碎发现沉淀目录，目录打平，文件名使用 `yyyy-mm-dd.md`。

## 常用命令

- 安装依赖：`pnpm install`
- 代码检查：`pnpm lint`
- 构建开发产物：`pnpm build:dev`
- 演示工程开发（在 `packages/demos`）：`pnpm dev`

## Agent 协作约定

- 零碎发现、排查过程、实验结论统一记录在 `specs/memory/yyyy-mm-dd.md`。
- 全局性发现、跨模块约束、可作为项目规范的内容沉淀在 `AGENTS.md`。
- 记录保持简短、可追溯、可执行，优先使用要点式表达。
