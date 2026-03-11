import {
  HostRoot,
  HostComponent,
  HostText,
  FunctionComponent,
} from "./workTags";
import { renderWithHooks } from "./fiberHooks";
import { processUpdateQueue } from "./updateQueue";
import { reconcileChildFibers } from "./childFiber";
import { mountChildFibers } from "./childFiber";

export function beginWork(fiber) {
  switch (fiber.tag) {
    case HostRoot:
      return updateHostRoot(fiber);
    case HostComponent:
      return updateHostComponent(fiber);
    case HostText:
      return null;
    case FunctionComponent:
      return updateFunctionComponent(fiber);
    default:
      console.error("beginWork未实现的类型", fiber.tag);
      return null;
  }
}

function updateFunctionComponent(workInProgress) {
  const nextChildren = renderWithHooks(workInProgress);
  reconcileChildren(workInProgress, nextChildren);
  return workInProgress.child;
}

function updateHostRoot(workInProgress) {
  const baseState = workInProgress.memoizedState;
  const updateQueue = workInProgress.updateQueue;

  workInProgress.memoizedState = processUpdateQueue(
    baseState,
    updateQueue,
    workInProgress,
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
