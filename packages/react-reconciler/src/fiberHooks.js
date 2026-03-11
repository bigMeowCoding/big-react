import sharedInternals from "shared/internals";
import {
  createUpdateQueue,
  createUpdate,
  enqueueUpdate,
  processUpdateQueue,
} from "./updateQueue";
import { scheduleUpdateOnFiber } from "./workLoop";

let workInProgressHook = null;
let currentRenderingFiber = null;
let currentHook = null;
const { currentDispatcher } = sharedInternals;

export function renderWithHooks(workInProgress) {
  currentRenderingFiber = workInProgress;
  // 重置,暂时不知道为什么重置
  workInProgress.memoizedState = null;
  workInProgress.updateQueue = null;

  const current = workInProgress.alternate;
  if (current === null) {
    currentDispatcher.current = HooksDispatcherOnMount;
  } else {
    currentDispatcher.current = HooksDispatcherOnUpdate;
  }
  const Component = workInProgress.type;
  const nextChildren = Component(workInProgress.pendingProps);
  // 重置
  currentRenderingFiber = null;
  workInProgressHook = null;
  currentHook = null;

  return nextChildren;
}

const HooksDispatcherOnMount = {
  useState: mountState,
};
const HooksDispatcherOnUpdate = {
  useState: updateState,
};

function mountState(initialState) {
  const hook = mountWorkInProgressHook();
  let memoizedState;
  if (initialState instanceof Function) {
    memoizedState = initialState();
  } else {
    memoizedState = initialState;
  }
  hook.memoizedState = memoizedState;
  if (currentRenderingFiber === null) {
    console.error("currentRenderingFiber is null");
  }

  const queue = createUpdateQueue();
  hook.updateQueue = queue;
  queue.dispatch = dispatchSetState.bind(null, currentRenderingFiber, queue);
  return [memoizedState, queue.dispatch];
}
function updateState() {
  const hook = updateWorkInProgressHook();
  const queue = hook.updateQueue;
  const baseState = hook.memoizedState;

  hook.memoizedState = processUpdateQueue(
    baseState,
    queue,
    currentRenderingFiber,
  );
  return [hook.memoizedState, queue.dispatch];
}

function mountWorkInProgressHook() {
  const hook = {
    memoizedState: null,
    updateQueue: null,
    next: null,
  };
  if (workInProgressHook === null) {
    if (currentRenderingFiber === null) {
      console.error("currentRenderingFiber is null");
    } else {
      currentRenderingFiber.memoizedState = workInProgressHook = hook;
    }
  } else {
    workInProgressHook = workInProgressHook.next = hook;
  }
  return workInProgressHook;
}

// 情况1:交互触发的更新，此时wipHook还不存在，复用 currentHook链表中对应的 hook 克隆 wipHook
// 情况2:render阶段触发的更新，wipHook已经存在，使用wipHook
function updateWorkInProgressHook() {
  let nextCurrentHook = null;
  let nextWorkInProgressHook = null;

  if (currentHook === null) {
    const current = currentRenderingFiber.alternate;
    if (current !== null) {
      nextCurrentHook = current.memoizedState;
    } else {
      nextCurrentHook = null;
    }
  } else {
    nextCurrentHook = currentHook.next;
  }
  if (workInProgressHook === null) {
    nextWorkInProgressHook = currentRenderingFiber.memoizedState;
  } else {
    nextWorkInProgressHook = workInProgressHook.next;
  }
  if (nextWorkInProgressHook !== null) {
    currentHook = nextCurrentHook;
    workInProgressHook = nextWorkInProgressHook;
  } else {
    if (nextCurrentHook === null) {
      console.error("本次hook比之前执行的多");
    }
    currentHook = nextCurrentHook;
    const newHook = {
      memoizedState: currentHook.memoizedState,
      updateQueue: currentHook.updateQueue,
      next: null,
    };
    if (workInProgressHook === null) {
      workInProgressHook = currentRenderingFiber.memoizedState = newHook;
    } else {
      workInProgressHook = workInProgressHook.next = newHook;
    }
  }
  return workInProgressHook;
}
function dispatchSetState(fiber, queue, action) {
  const update = createUpdate(action);
  enqueueUpdate(queue, update);
  scheduleUpdateOnFiber(fiber);
}
