import internals from "shared/internals";
import { createUpdate, createUpdateQueue } from "./updateQueue";
import { enqueueUpdate } from "./updateQueue";
import { scheduleUpdateOnFiber } from "./workLoop";
import { processUpdateQueue } from "./updateQueue";
import { NoLane, requestUpdateLane } from "./fiberLanes";

let currentlyRenderingFiber = null;
let workInProgressHook = null;
let currentHook = null;
let renderLane = NoLane;
const currentDispatcher = internals.currentDispatcher;
const HooksDispatcherOnMount = {
  useState: mountState,
};
const HooksDispatcherOnUpdate = {
  useState: updateState,
};

export function renderWithHooks(workInProgress, lane) {
  currentlyRenderingFiber = workInProgress;
  currentHook = null;
  workInProgressHook = null;
  renderLane = lane;

  workInProgress.memoizedState = null;
  workInProgress.updateQueue = null;

  const current = workInProgress.alternate;
  if (current !== null) {
    currentDispatcher.current = HooksDispatcherOnUpdate;
  } else {
    currentDispatcher.current = HooksDispatcherOnMount;
  }
  const Component = workInProgress.type;
  const props = workInProgress.pendingProps;
  const children = Component(props);

  currentlyRenderingFiber = null;
  currentHook = null;
  workInProgressHook = null;
  renderLane = NoLane;

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
  queue.dispatch = dispatchSetState.bind(null, currentlyRenderingFiber, queue);
  return [memoizedState, queue.dispatch];
}

function updateState() {
  const hook = updateWorkInProgressHook();
  const queue = hook.updateQueue;
  const pending = queue.shared.pending;

  if (pending !== null) {
    queue.shared.pending = null;
    const { memoizedState } = processUpdateQueue(
      hook.memoizedState,
      pending,
      renderLane
    );
    hook.memoizedState = memoizedState;
  }

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
  const lane = requestUpdateLane();
  const update = createUpdate(action, lane);
  enqueueUpdate(queue, update);
  scheduleUpdateOnFiber(fiber, lane);
}
