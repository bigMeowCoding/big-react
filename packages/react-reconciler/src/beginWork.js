import { HostRoot, HostComponent, HostText, Fragment } from "./workTags";
import { processUpdateQueue } from "./updateQueue";
import { reconcileChildFibers, mountChildFibers } from "./childFiber";
import { FunctionComponent } from "./workTags";
import { renderWithHooks } from "./fiberHook";

export function beginWork(workInProgress, renderLane) {
  switch (workInProgress.tag) {
    case HostRoot:
      return updateHostRoot(workInProgress, renderLane);
    case HostComponent:
      return updateHostComponent(workInProgress);
    case FunctionComponent:
      return updateFunctionComponent(workInProgress, renderLane);
    case Fragment:
      return updateFragment(workInProgress);
    case HostText:
      return null;
    default:
      console.log("beginWork未实现", workInProgress.tag);
      return null;
  }
}

function updateFragment(workInProgress) {
  const nextChildren = workInProgress.pendingProps;
  reconcileChildren(workInProgress, nextChildren);
  return workInProgress.child;
}

function updateHostRoot(workInProgress, renderLane) {
  const baseState = workInProgress.memoizedState;
  const updateQueue = workInProgress.updateQueue;
  const pending = updateQueue.shared.pending;
  updateQueue.shared.pending = null;
  const { memoizedState } = processUpdateQueue(
    baseState,
    pending,
    renderLane
  );
  workInProgress.memoizedState = memoizedState;

  const nextChildren = workInProgress.memoizedState;
  reconcileChildren(workInProgress, nextChildren);
  return workInProgress.child;
}

function updateHostComponent(workInProgress) {
  const nextProps = workInProgress.pendingProps;
  const nextChildren = nextProps.children;
  reconcileChildren(workInProgress, nextChildren);
  return workInProgress.child;
}

function updateFunctionComponent(workInProgress, renderLane) {
  const nextChildren = renderWithHooks(workInProgress, renderLane);
  reconcileChildren(workInProgress, nextChildren);
  return workInProgress.child;
}

function reconcileChildren(workInProgress, nextChildren) {
  const current = workInProgress.alternate;
  if (current !== null) {
    workInProgress.child = reconcileChildFibers(
      workInProgress,
      current.child,
      nextChildren
    );
  } else {
    workInProgress.child = mountChildFibers(workInProgress, null, nextChildren);
  }
}
