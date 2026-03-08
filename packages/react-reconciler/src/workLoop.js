import { createWorkInProgress } from "./fiber";
import { beginWork } from "./beginWork";
import { completeWork } from "./completeWork";
import { HostRoot } from "./workTags";
import { MutationMask } from "./fiberFlag";
import { NoFlags } from "./fiberFlag";
import { commitMutationEffects } from "./commitWork";
export let workInProgress = null;

export function scheduleUpdateOnFiber(fiber) {
  const root = markUpdateFromFiberToRoot(fiber);
  if (root === null) {
    return;
  }
  ensureRootIsScheduled(root);
}

export function markUpdateFromFiberToRoot(fiber) {
  let node = fiber;
  let parent = node.return;
  while (parent) {
    node = parent;
    parent = parent.return;
  }
  if (node.tag === HostRoot) {
    return node.stateNode;
  }
  return null;
}

export function ensureRootIsScheduled(root) {
  performSyncWorkOnRoot(root);
}

export function performSyncWorkOnRoot(root) {
  // 初始化操作
  prepareFreshStack(root);

  do {
    try {
      workLoop();
      break;
    } catch (e) {
      console.error("workLoop发生错误", e);
      workInProgress = null;
    }
  } while (true);
  console.log("render结束");
  if (workInProgress !== null) {
    console.error("render阶段结束时wip不为null");
  }
  const finishedWork = root.current.alternate;
  root.finishedWork = finishedWork;
  commitRoot(root);
}

function prepareFreshStack(root) {
  workInProgress = createWorkInProgress(root.current, {});
}

function workLoop() {
  while (workInProgress !== null) {
    workInProgress = performUnitOfWork(workInProgress);
  }
}

function performUnitOfWork(fiber) {
  const next = beginWork(fiber);
  if (next === null) {
    completeUnitOfWork(fiber);
  } else {
    workInProgress = next;
  }
  return workInProgress;
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
    if (sibling !== null) {
      workInProgress = sibling;
      return;
    }
    node = node.return;
    workInProgress = node;
  } while (node !== null);
}

function commitRoot(root) {
  const finishedWork = root.finishedWork;
  if (finishedWork === null) {
    return;
  }
  root.finishedWork = null;
  const subtreeHasEffects =
    (finishedWork.subtreeFlags & MutationMask) !== NoFlags;
  const rootHasEffect = (finishedWork.flags & MutationMask) !== NoFlags;
  if (subtreeHasEffects || rootHasEffect) {
    commitMutationEffects(finishedWork);
  }
  root.current = finishedWork;
}
