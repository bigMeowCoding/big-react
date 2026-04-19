# Hooks 与宿主层

本文说明 `useState` / Dispatcher 与 `hostConfig` 的职责边界。文档索引见 **[AGENTS.md](../AGENTS.md)**。

## Hooks 与 Dispatcher（`fiberHooks.js` + `react`）

- 在 **`renderWithHooks`** 开始处，根据是否有 `alternate` 切换 **`HooksDispatcherOnMount` / `HooksDispatcherOnUpdate`**，并赋给 **`shared/internals` → `currentDispatcher.current`**。
- 用户侧的 **`useState`**（`react/index.js`）通过 **`resolveDispatcher()`** 调用当前 dispatcher，从而在**协调器内部**执行真正的 mount/update 逻辑。
- **`dispatchSetState`**：`createUpdate` → `enqueueUpdate` → **`scheduleUpdateOnFiber`**，与根更新走同一套调度与 render/commit 流程。

Hooks 以链表挂在 **`fiber.memoizedState`** 上（当前实现聚焦 `useState`）。

## 宿主层 `hostConfig`（`react-dom`）

`react-reconciler` **不直接写** `document`，而是通过 **`react-dom/hostConfig`**（如 `createInstance`、`appendChildToContainer`、`insertChildToContainer`、`commitTextUpdate`、`removeChild`）操作 DOM。  
这样同一套 reconciler 逻辑可以替换为其他宿主（如 canvas、测试环境），只需换一套 host 实现。

## 相关文档

| 上一篇 | 下一篇 |
|--------|--------|
| [04-运行链路](./04-运行链路.md) | [06-与React差异](./06-与React差异.md) |
