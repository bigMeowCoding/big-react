import { MutationMask } from "./fiberFlag";
import { NoFlags } from "./fiberFlag";
import { Placement } from "./fiberFlag";
import { HostRoot } from "./workTags";
import { HostComponent } from "./workTags";
import { HostText } from "./workTags";
import { appendChildToContainer } from "react-dom/hostConfig";

let nextEffect = null;

export const commitMutationEffects = (finishedWork) => {
  nextEffect = finishedWork;
  while (nextEffect !== null) {
    const child = nextEffect.child;
    if (
      (nextEffect.subtreeFlags & MutationMask) !== NoFlags &&
      child !== null
    ) {
      nextEffect = child;
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
};

function commitMutationEffectsOnFiber(fiber) {
  const flags = fiber.flags;
  if ((flags & Placement) !== NoFlags) {
    commitPlacement(fiber);
    fiber.flags &= ~Placement;
  }
}
function commitPlacement(fiber) {
  const hostParent = getHostParent(fiber);
  let hostParentNode = null;
  switch (hostParent.tag) {
    case HostRoot:
      hostParentNode = hostParent.stateNode.container;
      break;
    case HostComponent:
      hostParentNode = hostParent.stateNode;
      break;
  }
  appendPlacementNodeIntoContainer(fiber, hostParentNode);
}
function appendPlacementNodeIntoContainer(fiber, hostParentNode) {
  if (fiber.tag === HostComponent || fiber.tag === HostText) {
    appendChildToContainer(fiber.stateNode, hostParentNode);
    return;
  }
  const child = fiber.child;
  while (child !== null) {
    appendPlacementNodeIntoContainer(child, hostParentNode);
    let sibling = child.sibling;
    while (sibling !== null) {
      appendPlacementNodeIntoContainer(sibling, hostParentNode);
      sibling = sibling.sibling;
    }
  }
}
function getHostParent(fiber) {
  let parent = fiber.return;
  while (parent !== null) {
    const parentTag = parent.tag;
    if (parentTag === HostComponent || parentTag === HostRoot) {
      return parent;
    }
    parent = parent.return;
  }
  console.error("未找到host父节点", fiber);
}
