import { scheduleMicroTask } from "react-dom/src/hostConfig";
import { HostRoot } from "./workTags";
import { createWorkInProgress } from "./fiber";
import { MutationMask, NoFlags } from "./fiberFlags";
import { commitMutationEffects } from "./commitWork";
import { beginWork } from "./beginWork";
import { completeWork } from "./completeWork";
import {
  getHighestPriorityLane,
  markRootFinished,
  mergeLanes,
  NoLane,
  SyncLane,
} from "./fiberLanes";
import { flushSyncCallbacks, scheduleSyncCallback } from "./syncTaskQueue";

let workInProgress = null;
let wipRootRenderLane = NoLane;

export function scheduleUpdateOnFiber(fiber, lane) {
  const root = markUpdateFromFiberToRoot(fiber);
  if (root === null) {
    return;
  }
  markRootUpdated(root, lane);
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

function markRootUpdated(root, lane) {
  root.pendingLanes = mergeLanes(root.pendingLanes, lane);
}

function ensureRootIsScheduled(root) {
  const updateLane = getHighestPriorityLane(root.pendingLanes);
  if (updateLane === NoLane) {
    return;
  }
  if (updateLane === SyncLane) {
    scheduleSyncCallback(performSyncWorkOnRoot.bind(null, root, updateLane));
    scheduleMicroTask(flushSyncCallbacks);
  }
}

function performSyncWorkOnRoot(root, lane) {
  const nextLane = getHighestPriorityLane(root.pendingLanes);
  if (nextLane !== SyncLane) {
    ensureRootIsScheduled(root);
    return;
  }

  prepareFreshStack(root, lane);

  do {
    try {
      workLoop();
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
  root.finishedLane = lane;
  wipRootRenderLane = NoLane;

  commitRoot(root);
}

function commitRoot(root) {
  const { finishedWork } = root;
  if (finishedWork === null) {
    return;
  }

  const lane = root.finishedLane;
  root.finishedWork = null;
  root.finishedLane = NoLane;
  markRootFinished(root, lane);

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

function prepareFreshStack(root, lane) {
  workInProgress = createWorkInProgress(root.current, {});
  wipRootRenderLane = lane;
}

function workLoop() {
  while (workInProgress !== null) {
    performUnitOfWork(workInProgress);
  }
}

function performUnitOfWork(fiber) {
  const next = beginWork(fiber, wipRootRenderLane);
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
