# AGENTS.md

本文件为本仓库的 **AI 编码助手上下文**。更细的实现说明在 `docs/` 下分篇，按下面小节按需打开即可，不必按文件名序号通读。

## 项目概览

这是一个**从零实现的 React 核心**——为学习而简化的 React 源码，实现 Fiber 架构、协调器（reconciler）与渲染管线。

### 仓库边界与目录从哪看

先 [项目定位](docs/01-项目定位.md)（学什么、技术栈、怎么跑），再 [架构与包依赖](docs/02-架构与包依赖.md)（`packages` 里各包干什么、`react` / `react-reconciler` / `react-dom` 怎么接）。

### 一轮更新怎么从根走到 DOM

名词：[核心概念](docs/03-核心概念.md)（Fiber、双缓冲、flags）。整条链路：[运行链路](docs/04-运行链路.md)（`createRoot` → commit、和源码对应关系）。Hooks 与真实 DOM 的交界：[Hooks 与宿主](docs/05-Hooks与宿主.md)。

### 和真 React 差在哪

见 [与 React 差异](docs/06-与React差异.md)（简化点、以后可往哪扩）。

只在 `docs/` 里翻文件名时，可看 [docs/README.md](docs/README.md)。

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

## 架构速览

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

### 渲染管线（摘要）

1. **Render 阶段**（beginWork → completeWork）：构建 fiber 树，标记副作用
2. **Commit 阶段**（commitWork）：将变更应用到真实 DOM

当前实现为**同步**调度；展开说明见 [运行链路](docs/04-运行链路.md)。

## 开发说明

- 使用 pnpm workspaces 管理 monorepo
- 演示用 Vite，包构建用 Rollup
- 当前未配置测试
- 当前分支为 `v4`，主分支为 `main`
