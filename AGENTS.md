# AGENTS.md

本文件为在本仓库中工作的 AI 编码助手提供项目上下文与常用约定。

## 项目概览

这是一个**从零实现的 React 核心**——为学习而简化的 React 源码，实现 Fiber 架构、协调器（reconciler）与渲染管线。

## 常用命令

```bash
# 安装依赖
pnpm install

# 开发服务器（demos）
pnpm dev

# 代码检查
pnpm lint

# 自动修复 lint
pnpm lint:fix

# 格式化
pnpm format

# 检查格式
pnpm format:check
```

## 架构

### Monorepo 结构

```
packages/
├── react/              # React 核心 API（jsx、useState dispatcher）
├── react-reconciler/  # Fiber 协调器实现
├── react-dom/          # DOM 渲染与 host config
├── shared/             # 共享工具与符号
└── demos/              # 示例应用
```

### 关键源码

**react-reconciler/src/**

- `fiber.js` — Fiber 节点数据结构
- `fiberHooks.js` — Hooks 实现（useState）
- `workLoop.js` — 主工作循环（render 与 commit 阶段）
- `beginWork.js` — 阶段一：begin
- `completeWork.js` — 阶段一：complete
- `commitWork.js` — 阶段二：提交到 DOM
- `childFiber.js` — 子节点协调
- `updateQueue.js` — 状态更新队列

**react-dom/src/**

- `hostConfig.js` — DOM 操作（createElement、appendChild 等）
- `SyntheticEvent.js` — 合成事件

**react/src/**

- `jsx.js` / `jsx-dev-runtime.js` — JSX 转换

### 渲染管线

1. **Render 阶段**（beginWork → completeWork）：构建 fiber 树，计算 DOM 更新
2. **Commit 阶段**（commitWork）：将变更应用到真实 DOM

工作循环使用 fiber 链表，并按优先级处理节点。

## 开发说明

- 使用 pnpm workspaces 管理 monorepo
- 演示用 Vite，包构建用 Rollup
- 当前未配置测试
- 当前分支为 `v4`，主分支为 `main`
