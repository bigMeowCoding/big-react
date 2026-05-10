import { HostRoot } from "./workTags";
import { createWorkInProgress } from "./fiber";
import { MutationMask, NoFlags } from "./fiberFlags";
import { commitMutationEffects } from "./commitWork";
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

  if (workInProgress !== null) {
    console.error("render阶段剩余未完成的工作", workInProgress);
  }
  const finishedWork = root.current.alternate;
  root.finishedWork = finishedWork;
  console.log("render阶段完成", finishedWork);
  commitRoot(root);
}

function commitRoot(root) {
  const { finishedWork } = root;
  if (finishedWork === null) {
    return;
  }
  root.finishedWork = null;

  const subtreeHasEffects =
    (finishedWork.subtreeFlags & MutationMask) !== NoFlags;
  const rootHasEffect = (finishedWork.flags & MutationMask) !== NoFlags;
  if (subtreeHasEffects || rootHasEffect) {
    commitMutationEffects(finishedWork);
    root.current = finishedWork;
  } else {
    root.current = finishedWork;
  }
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
