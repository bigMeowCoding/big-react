import { Mutation } from "./fiberFlags";
import { NoFlags } from "./fiberFlags";
import { Placement } from "./fiberFlags";
import { HostRoot, HostComponent, HostText } from "./workTags";
import { appendChildToContainer } from "react-dom/src/hostConfig";

export function commitMutationEffects(finishedWork) {
  let nextEffect = finishedWork;
  while (nextEffect !== null) {
    if (
      (nextEffect.subtreeFlags & Mutation) !== NoFlags &&
      nextEffect.child !== null
    ) {
      nextEffect = nextEffect.child;
    } else {
      up: while (nextEffect !== null) {
        commitMutationEffectsOnFiber(nextEffect);
        const sibling = nextEffect.sibling;
        if (sibling !== null) {
          nextEffect = sibling;
          break up;
        }
        nextEffect = nextEffect.return;
      }
    }
  }
}

function commitMutationEffectsOnFiber(fiber) {
  const { flags } = fiber;
  if ((flags & Mutation) !== NoFlags) {
    commitPlacement(fiber);
    fiber.flags &= ~Placement;
  }
}

function commitPlacement(fiber) {
  const hostParent = getHostParent(fiber);

  let parentNode = null;
  switch (hostParent.tag) {
    case HostRoot:
      parentNode = hostParent.stateNode.container;
      break;
    case HostComponent:
      parentNode = hostParent.stateNode;
      break;
    default:
      console.error("未实现的commitPlacement类型");
  }
  appendPlacementNodeToContainer(fiber, parentNode);
}

function appendPlacementNodeToContainer(fiber, parentNode) {
  if (fiber.tag === HostText || fiber.tag === HostComponent) {
    appendChildToContainer(parentNode, fiber.stateNode);
    return;
  }
  const child = fiber.child;
  if (child !== null) {
    appendPlacementNodeToContainer(child, parentNode);
    let sibling = child.sibling;
    while (sibling !== null) {
      appendPlacementNodeToContainer(sibling, parentNode);
      sibling = sibling.sibling;
    }
  }
}

function getHostParent(fiber) {
  let parent = fiber.return;
  while (parent) {
    const parentTag = parent.tag;
    if (parentTag === HostRoot || parentTag === HostComponent) {
      return parent;
    }
    parent = parent.return;
  }
  console.error("未找到host parent");
  return null;
}
