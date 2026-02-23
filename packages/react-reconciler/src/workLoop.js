import { HostRoot } from "./workTags";
import { createWorkInProgress } from "./fiber";
import { beginWork } from "./beginWork";
import { completeWork } from "./completeWork";

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
  let parent = fiber.return;
  while (parent !== null) {
    node = parent;
    parent = parent.return;
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
      workLoop();
      break;
    } catch (error) {
      console.error(error);
      workInProgress = null;
    }
  } while (true);
  console.log("render阶段结束");
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
