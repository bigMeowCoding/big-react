import { HostRoot } from "./workTags";
import { createWorkInProgress } from "./fiber";
import { beginWork } from "./beginWork";
import { completeWork } from "./completeWork";
import { commitMutationEffects } from "./commitWork";
import { Mutation } from "./fiberFlags";
import { NoFlags } from "./fiberFlags";
import {
  mergeLanes,
  NoLanes,
  getHighestPriorityLane,
  markRootFinished,
} from "./fiberLanes";
import { SyncLane } from "./fiberLanes";
import { scheduleMicrotask } from "react-dom/src/hostConfig";
import { scheduleSyncCallback, flushSyncCallbacks } from "./syncTaskQueue";

let workInProgress = null;
let workInProgressRootRenderLane = NoLanes;

export function scheduleUpdateOnFiber(fiber, renderLane) {
  console.log("开始调度更新", fiber, renderLane);

  const root = markUpdateLaneFromFiberToRoot(fiber, renderLane);
  markRootUpdated(root, renderLane);
  if (root === null) {
    return;
  }
  ensureRootIsScheduled(root);
}

function markRootUpdated(root, lane) {
  root.pendingLanes = mergeLanes(root.pendingLanes, lane);
}

function markUpdateLaneFromFiberToRoot(fiber, lane) {
  let node = fiber;
  let parent = fiber.return;
  node.lanes = mergeLanes(node.lanes, lane);
  if (node.alternate) {
    node.alternate.lanes = mergeLanes(node.alternate.lanes, lane);
  }
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
  const updateLane = getHighestPriorityLane(root.pendingLanes);
  if (updateLane === NoLanes) {
    return;
  }
  if (updateLane === SyncLane) {
    console.log("同步优先级，执行同步更新");
    scheduleSyncCallback(performSyncWorkOnRoot.bind(null, root, updateLane));
    scheduleMicrotask(flushSyncCallbacks);
  }
}

function performSyncWorkOnRoot(root, lane) {
  const nextLane = getHighestPriorityLane(root.pendingLanes);
  if (nextLane !== SyncLane) {
    ensureRootIsScheduled(root);
    return;
  }
  console.log("开始render阶段");

  prepareFreshStack(root, lane);
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
  workInProgressRootRenderLane = NoLanes;

  // render阶段结束，获取更新后的fiber树交给commit阶段
  const finishedWork = root.current.alternate;
  root.finishedWork = finishedWork;
  root.finishedLane = lane;

  // commit阶段操作
  commitRoot(root);
}

function prepareFreshStack(root, lane) {
  console.log("render阶段初始化工作");

  workInProgress = createWorkInProgress(root.current, {});
  workInProgressRootRenderLane = lane;
}

function workLoop() {
  while (workInProgress !== null) {
    performUnitOfWork(workInProgress);
  }
}

function performUnitOfWork(fiber) {
  const next = beginWork(fiber, workInProgressRootRenderLane);
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
  console.log("开始commit阶段", finishedWork);
  const lane = root.finishedLane;

  root.finishedWork = null;
  root.finishedLane = NoLanes;
  markRootFinished(root, lane);
  if (lane === NoLanes) {
    console.error("commit阶段finishedLane不应该是NoLane");

    return;
  }
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
