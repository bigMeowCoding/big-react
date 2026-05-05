import { MutationMask, NoFlags, Placement } from "./fiberFlags";
import { HostRoot, HostComponent, HostText } from "./workTags";
let nextEffect = null;
import { appendChildToContainer } from "react/src/hostConfig";
export function commitMutationEffects(finishedWork) {
  nextEffect = finishedWork;
  while (nextEffect !== null) {
    let child = nextEffect.child;
    if (
      (nextEffect.subtreeFlags & MutationMask) !== NoFlags &&
      child !== null
    ) {
      nextEffect = child;
    } else {
      up: while (nextEffect !== null) {
        commitMutationEffectsOnFiber(nextEffect);
        if (nextEffect.sibling !== null) {
          nextEffect = nextEffect.sibling;
          break up;
        }
        nextEffect = nextEffect.return;
      }
    }
  }
}

function commitMutationEffectsOnFiber(finishedWork) {
  const { flags } = finishedWork;
  if ((flags & Placement) !== NoFlags) {
    commitPlacement(finishedWork);
    finishedWork.flags &= ~Placement;
  }
}

function commitPlacement(finishedWork) {
  let hostParent = getHostParent(finishedWork);
  let parentNode = null;
  switch (hostParent.tag) {
    case HostRoot:
      parentNode = hostParent.stateNode.container;
      break;
    case HostComponent:
      parentNode = hostParent.stateNode;
      break;
    default:
      console.warn("未实现的commitPlacement类型", hostParent);
  }
  insertOrAppendPlacementNodeIntoContainer(finishedWork, parentNode);
}

function getHostParent(finishedWork) {
  let parent = finishedWork.return;
  while (parent !== null) {
    if (isHostParent(parent)) {
      return parent;
    }
    parent = parent.return;
  }
  console.warn("未找到hostParent", finishedWork);
  return null;
}

function isHostParent(fiber) {
  return fiber.tag === HostRoot || fiber.tag === HostComponent;
}

function insertOrAppendPlacementNodeIntoContainer(fiber, hostParent) {
  if (fiber.tag === HostComponent || fiber.tag === HostText) {
    appendChildToContainer(hostParent, fiber.stateNode);
    return;
  }

  let child = fiber.child;
  if (child !== null) {
    insertOrAppendPlacementNodeIntoContainer(child, hostParent);
    let sibling = child.sibling;
    while (sibling !== null) {
      insertOrAppendPlacementNodeIntoContainer(sibling, hostParent);
      sibling = sibling.sibling;
    }
  }
}
