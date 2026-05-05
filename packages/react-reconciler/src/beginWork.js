import { HostRoot, HostComponent, HostText } from "./workTags";
import { processUpdateQueue } from "./updateQueue";
import { reconcileChildFibers, mountChildFibers } from "./childFiber";
import { FunctionComponent } from "./workTags";
import { renderWithHooks } from "./fiberHook";

export function beginWork(workInProgress) {
  switch (workInProgress.tag) {
    case HostRoot:
      return updateHostRoot(workInProgress);
    case HostComponent:
      return updateHostComponent(workInProgress);
    case FunctionComponent:
      return updateFunctionComponent(workInProgress);
    case HostText:
      return null;
    default:
      console.log("beginWork未实现", workInProgress.tag);
      return null;
  }
}

function updateHostRoot(workInProgress) {
  processUpdateQueue(workInProgress);
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

function updateFunctionComponent(workInProgress) {
  const nextChildren = renderWithHooks(workInProgress);
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
