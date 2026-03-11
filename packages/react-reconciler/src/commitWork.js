import { ChildDeletion, MutationMask, Update } from "./fiberFlag";
import { NoFlags } from "./fiberFlag";
import { Placement } from "./fiberFlag";
import { HostRoot } from "./workTags";
import { HostComponent } from "./workTags";
import { HostText } from "./workTags";
import { FunctionComponent } from "./workTags";
import { appendChildToContainer } from "react-dom/hostConfig";
import { commitTextUpdate, removeChild } from "react-dom/hostConfig";
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
  if ((flags & Update) !== NoFlags) {
    commitUpdate(fiber);
    fiber.flags &= ~Update;
  }
  if ((flags & ChildDeletion) !== NoFlags) {
    commitDeletion(fiber);
    fiber.flags &= ~ChildDeletion;
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
function commitUpdate(fiber) {
  switch (fiber.tag) {
    case HostText:
      const newContent = fiber.pendingProps.content;
      return commitTextUpdate(fiber.stateNode, newContent);
  }
  console.error("commitUpdate未实现的类型", fiber);
}
/**
 * 删除需要考虑：
 * HostComponent：需要遍历他的子树，为后续解绑ref创造条件，HostComponent本身只需删除最上层节点即可
 * FunctionComponent：effect相关hook的执行，并遍历子树
 */
function commitDeletion(fiber) {
  let firstHostFiber = null;
  commitNestedUnmounts(fiber, (unmountedFiber) => {
    switch (unmountedFiber.tag) {
      case HostComponent:
        if (firstHostFiber === null) {
          firstHostFiber = unmountedFiber;
        }
        return;
      case HostText:
        if (firstHostFiber === null) {
          firstHostFiber = unmountedFiber;
        }
        return;
      case FunctionComponent:
        break;
    }
  });
  if (firstHostFiber !== null) {
    const hostParent = getHostParent(firstHostFiber);
    removeChild(firstHostFiber.stateNode, hostParent);
  }
  fiber.return = null;
  fiber.child = null;
}
function commitNestedUnmounts(fiber, callback) {
  let node = fiber;
  while (true) {
    callback(node);
    if (node.child !== null) {
      node = node.child;
      continue;
    }
    if (node === fiber) {
      return;
    }
    while (node.sibling === null) {
      if (node.return === null || node.return === fiber) {
        return;
      }
      node = node.return;
    }
    node.sibling.return = node.return;
    node = node.sibling;
  }
}
function appendPlacementNodeIntoContainer(fiber, hostParentNode) {
  if (fiber.tag === HostComponent || fiber.tag === HostText) {
    appendChildToContainer(fiber.stateNode, hostParentNode);
    return;
  }
  const child = fiber.child;
  if (child !== null) {
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
