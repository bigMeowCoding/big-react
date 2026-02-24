import { HostRoot } from "./workTags";
import { createWorkInProgress } from "./fiber";
import { beginWork } from "./beginWork";
import { completeWork } from "./completeWork";
import { commitMutationEffects } from "./commitWork";
import { Mutation } from "./fiberFlags";
import { NoFlags } from "./fiberFlags";
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
  if (workInProgress !== null) {
    console.error("render阶段结束时wip不为null");
  }
  // render阶段结束，获取更新后的fiber树交给commit阶段
  const finishedWork = root.current.alternate;
  root.finishedWork = finishedWork;

  // commit阶段操作
  commitRoot(root);
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
  // 执行完beginWork后，pendingProps 变为 memoizedProps
  fiber.memoizedProps = fiber.pendingProps;
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
function commitRoot(root) {
  const finishedWork = root.finishedWork;
  if (finishedWork === null) {
    return;
  }
  root.finishedWork = null;
  const subtreeHasEffects = (finishedWork.subtreeFlags & Mutation) !== NoFlags;
  const rootHasEffect = (finishedWork.flags & Mutation) !== NoFlags;
  if (subtreeHasEffects || rootHasEffect) {
    commitMutationEffects(finishedWork);
    root.current = finishedWork;
  } else {
    root.current = finishedWork;
  }
  console.log("commit阶段结束");
}
