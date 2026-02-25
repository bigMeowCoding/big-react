import {
  HostComponent,
  HostRoot,
  HostText,
  FunctionComponent,
} from "./workTags";
import { processUpdateQueue } from "./updateQueue";
import { reconcileChildFibers, mountChildFibers } from "./childFiber";
import { renderWithHooks } from "./fiberHooks";
import { NoLanes } from "./fiberLanes";

export function beginWork(workInProgress, renderLane) {
  console.log("beginWork", workInProgress, renderLane);
  workInProgress.lane = NoLanes;
  switch (workInProgress.tag) {
    case HostRoot:
      return updateHostRoot(workInProgress, renderLane);
    case HostComponent:
      return updateHostComponent(workInProgress);
    case HostText:
      return null;
    case FunctionComponent:
      return updateFunctionComponent(workInProgress, renderLane);
    default:
      console.error("beginWork未实现的类型");
      return null;
  }
}

function updateHostRoot(workInProgress, renderLane) {
  const baseState = workInProgress.memoizedState;
  const updateQueue = workInProgress.updateQueue;
  workInProgress.memoizedState = processUpdateQueue(
    baseState,
    updateQueue,
    workInProgress,
    renderLane,
  );
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
      nextChildren,
    );
  } else {
    workInProgress.child = mountChildFibers(workInProgress, null, nextChildren);
  }
}
