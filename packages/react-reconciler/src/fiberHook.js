import internals from "shared/internals";
import { createUpdate, createUpdateQueue } from "./updateQueue";
import { enqueueUpdate } from "./updateQueue";
import { scheduleUpdateOnFiber } from "./workLoop";
import { processUpdateQueue } from "./updateQueue";

let currentlyRenderingFiber = null;
let workInProgressHook = null;
let currentHook = null;
const currentDispatcher = internals.currentDispatcher;
const HooksDispatcherOnMount = {
  useState: mountState,
};
const HooksDispatcherOnUpdate = {
  useState: updateState,
};

export function renderWithHooks(workInProgress) {
  currentlyRenderingFiber = workInProgress;

  workInProgress.memoizedState = null;
  workInProgress.updateQueue = null;

  const current = workInProgress.alternate;
  if (current !== null) {
    currentDispatcher.current = HooksDispatcherOnUpdate;
  } else {
    console.log("mount时renderWithHooks");
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

function updateState() {
  const hook = updateWorkInProgressHook();
  const queue = hook.updateQueue;
  let baseState = hook.memoizedState;

  hook.memoizedState = processUpdateQueue(
    baseState,
    queue,
    currentlyRenderingFiber
  );
  return [hook.memoizedState, queue.dispatch];
}

function updateWorkInProgressHook() {
  let nextCurrentHook;
  let nextWorkInProgressHook;

  if (currentHook === null) {
    const current = currentlyRenderingFiber.alternate;
    nextCurrentHook = current.memoizedState;
  } else {
    nextCurrentHook = currentHook.next;
  }
  if (workInProgressHook === null) {
    nextWorkInProgressHook = currentlyRenderingFiber.memoizedState;
  } else {
    nextWorkInProgressHook = workInProgressHook.next;
  }
  if (nextWorkInProgressHook !== null) {
    workInProgressHook = nextWorkInProgressHook;
    currentHook = nextCurrentHook;
  } else {
    if (nextCurrentHook === null) {
      console.error("updateWorkInProgressHook时nextCurrentHook不存在");
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
function mountWorkInProgressHook() {
  const hook = {
    memoizedState: null,
    updateQueue: null,
    next: null,
  };
  if (workInProgressHook === null) {
    currentlyRenderingFiber.memoizedState = workInProgressHook = hook;
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
