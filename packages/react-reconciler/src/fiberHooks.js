import sharedInternals from "shared/internals";
import { createUpdateQueue } from "./updateQueue";
import { createUpdate, enqueueUpdate } from "./updateQueue";
import { scheduleUpdateOnFiber } from "./workLoop";
import { processUpdateQueue } from "./updateQueue";

const { currentDispatcher } = sharedInternals;

let currentlyRenderingFiber = null;
let workInProgressHook = null;
let currentHook = null;

const HooksDispatcherOnMount = {
  useState: mountState,
};
const HooksDispatcherOnUpdate = {
  useState: updateState,
};

export function renderWithHooks(workInProgress) {
  currentlyRenderingFiber = workInProgress;
  currentHook = null;

  workInProgress.memoizedState = null;
  workInProgress.updateQueue = null;

  const current = workInProgress.alternate;
  if (current === null) {
    currentDispatcher.current = HooksDispatcherOnMount;
  } else {
    currentDispatcher.current = HooksDispatcherOnUpdate;
  }
  const Component = workInProgress.type;
  const props = workInProgress.pendingProps;
  const children = Component(props);

  // 重置
  currentlyRenderingFiber = null;
  workInProgressHook = null;
  currentHook = null;

  return children;
}

function mountState(initialState) {
  const hook = mountWorkInProgressHook();
  let memoizedState;
  if (initialState instanceof Function) {
    memoizedState = initialState();
  } else {
    memoizedState = initialState;
  }
  hook.memoizedState = memoizedState;
  if (currentlyRenderingFiber === null) {
    console.error("currentlyRenderingFiber is null");
  }
  const queue = createUpdateQueue();
  const dispatch = dispatchSetState.bind(null, currentlyRenderingFiber, queue);
  hook.updateQueue = queue;
  queue.dispatch = dispatch;
  return [memoizedState, queue.dispatch];
}

function mountWorkInProgressHook() {
  const hook = {
    memoizedState: null, // 上一次的state
    updateQueue: null, // 更新队列
    next: null, // 下一个hook
  };
  if (workInProgressHook === null) {
    if (currentlyRenderingFiber === null) {
      console.error("currentlyRenderingFiber is null");
    } else {
      // 当前fiber的第一个hook
      currentlyRenderingFiber.memoizedState = workInProgressHook = hook;
    }
  } else {
    // 当前fiber的下一个hook
    workInProgressHook = workInProgressHook.next = hook;
  }
  workInProgressHook = hook;
  return hook;
}
function updateState() {
  const hook = updateWorkInProgressHook();
  const queue = hook.updateQueue;
  const baseState = hook.memoizedState;

  hook.memoizedState = processUpdateQueue(
    baseState,
    queue,
    currentlyRenderingFiber,
  );

  return [hook.memoizedState, queue.dispatch];
}
/**
 * @description 情况1:交互触发的更新，此时wipHook还不存在，复用 currentHook链表中对应的 hook 克隆 wipHook
 * @description 情况2:render阶段触发的更新，wipHook已经存在，使用wipHook
 *
 */
function updateWorkInProgressHook() {
  let nextCurrentHook;
  let nextWorkInProgressHook;

  if (currentHook === null) {
    const current = currentlyRenderingFiber.alternate;
    if (current !== null) {
      nextCurrentHook = current.memoizedState;
    } else {
      nextCurrentHook = null;
    }
  } else {
    nextCurrentHook = currentHook.next;
  }
  if (workInProgressHook === null) {
    nextWorkInProgressHook = currentlyRenderingFiber.memoizedState;
  } else {
    nextWorkInProgressHook = workInProgressHook.next;
  }
  if (nextWorkInProgressHook !== null) {
    currentHook = nextCurrentHook;
    workInProgressHook = nextWorkInProgressHook;
  } else {
    if (nextCurrentHook === null) {
      console.error(
        "Rendered fewer hooks than expected. This may be caused by an accidental early return statement.",
      );
    }
    currentHook = nextCurrentHook;
    const newHook = {
      memoizedState: currentHook.memoizedState,
      updateQueue: currentHook.updateQueue,
      next: null,
    };
    if (workInProgressHook === null) {
      currentlyRenderingFiber.memoizedState = workInProgressHook = newHook;
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
