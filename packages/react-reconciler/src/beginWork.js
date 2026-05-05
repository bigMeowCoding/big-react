import { HostRoot, HostComponent } from "./workTags";
import { processUpdateQueue } from "./updateQueue";
export function beginWork(workInProgress) {
  switch (workInProgress.tag) {
    case HostRoot:
      return updateHostRoot(workInProgress);
    case HostComponent:
      return updateHostComponent(workInProgress);
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

function reconcileChildren(workInProgress, nextChildren) {
  const previousChildren = workInProgress.child;
  const newFiber = createFiber(nextChildren, workInProgress);
  workInProgress.child = newFiber;
  return newFiber;
}
