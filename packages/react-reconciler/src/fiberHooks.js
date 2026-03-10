import sharedInternals from "shared/internals";
import { createUpdateQueue, createUpdate, enqueueUpdate } from "./updateQueue";
import { scheduleUpdateOnFiber } from "./workLoop";

let workInProgressHook = null;
let currentRenderingFiber = null;

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
    console.error("update的时候hook还没实现");
  }
  const Component = workInProgress.type;
  const nextChildren = Component(workInProgress.pendingProps);
  // 重置
  currentRenderingFiber = null;
  workInProgressHook = null;

  return nextChildren;
}

const HooksDispatcherOnMount = {
  useState: mountState,
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

  return [
    memoizedState,
    dispatchSetState.bind(null, currentRenderingFiber, queue),
  ];
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

function dispatchSetState(fiber, queue, action) {
  const update = createUpdate(action);
  enqueueUpdate(queue, update);
  scheduleUpdateOnFiber(fiber);
}
