import { HostRoot } from "./workTags";
import { createWorkInProgress } from "./fiber";
let workInProgress = null;
export function scheduleUpdateOnFiber(fiber) {
  const root = markUpdateFromFiberToRoot(fiber);
  if (root === null) {
    return;
  }
  ensureRootIsScheduled(root);
}

function markUpdateFromFiberToRoot(fiber) {
  let node = fiber;
  let parent = node.return;
  while (parent !== null) {
    node = parent;
    parent = node.return;
  }
  if (node.tag === HostRoot) {
    return node.stateNode;
  }
  return null;
}

function ensureRootIsScheduled(root) {
  performSyncWorkOnRoot(root);
}

function performSyncWorkOnRoot(root) {
  prepareFreshStack(root);
  do {
    try {
      workLoop(root);
      break;
    } catch (error) {
      console.error("react-reconciler: caught error in work loop", error);
      workInProgress = null;
    }
  } while (true);
  console.log("render结束");
}

function prepareFreshStack(root) {
  workInProgress = createWorkInProgress(root.current, {});
}

function workLoop() {
  while (workInProgress !== null) {
    performUnitOfWork(workInProgress);
  }
}

function performUnitOfWork(fiber) {
  const next = beginWork(fiber);
  if (next === null) {
    completeUnitOfWork(fiber);
  } else {
    workInProgress = next;
  }
}

function completeUnitOfWork(fiber) {
  let node = fiber;
  do {
    const next = completeWork(node);
    if (next !== null) {
      workInProgress = next;
      return;
    }
    const sibling = node.sibling;
    if (sibling) {
      workInProgress = sibling;
      return;
    }
    node = node.return;
    workInProgress = node;
  } while (node !== null);
}
