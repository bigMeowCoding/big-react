import currentDispatcher from "shared/internals";
import { createUpdate, createUpdateQueue } from "./updateQueue";
import { enqueueUpdate } from "./updateQueue";
import { scheduleUpdateOnFiber } from "./workLoop";

let currentlyRenderingFiber = null;
let workInProgressHook = null;
const HooksDispatcherOnMount = {
  useState: mountState,
};

export function renderWithHooks(workInProgress) {
  currentlyRenderingFiber = workInProgress;

  workInProgress.memoizedState = null;
  workInProgress.updateQueue = null;

  const current = workInProgress.alternate;
  if (current !== null) {
    console.error("还未实现update时renderWithHooks");
  } else {
    currentDispatcher.current = HooksDispatcherOnMount;
  }
  const Component = workInProgress.type;
  const props = workInProgress.pendingProps;
  const children = Component(props);

  currentlyRenderingFiber = null;
  workInProgressHook = null;

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

  if (currentlyRenderingFiber === null) {
    console.error("mountState时currentlyRenderingFiber不存在");
  }
  hook.memoizedState = memoizedState;

  const queue = createUpdateQueue();
  hook.updateQueue = queue;

  return [
    memoizedState,
    dispatchSetState.bind(null, currentlyRenderingFiber, queue),
  ];
}

function mountWorkInProgressHook() {
  const hook = {
    memoizedState: null,
    updateQueue: null,
    next: null,
  };
  if (workInProgressHook === null) {
    if (currentlyRenderingFiber === null) {
      console.warn("currentlyRenderingFiber is null");
    } else {
      currentlyRenderingFiber.memoizedState = workInProgressHook = hook;
    }
  } else {
    workInProgressHook = workInProgressHook.next = hook;
  }
  return workInProgressHook;
}

function dispatchSetState(fiber, queue, action) {
  const update = createUpdate(action);
  enqueueUpdate(fiber, update);
  scheduleUpdateOnFiber(fiber);
}
