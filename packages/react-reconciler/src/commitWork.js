import { Mutation, Update, ChildDeletion } from "./fiberFlags";
import { NoFlags } from "./fiberFlags";
import { Placement } from "./fiberFlags";
import {
  HostRoot,
  HostComponent,
  HostText,
  FunctionComponent,
} from "./workTags";
import {
  appendChildToContainer,
  commitTextUpdate,
} from "react-dom/src/hostConfig";
import { removeChild } from "react-dom/src/hostConfig";

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
  if ((flags & Update) !== NoFlags) {
    commitUpdate(fiber);
    fiber.flags &= ~Update;
  }
  if ((flags & ChildDeletion) !== NoFlags) {
    const deletions = fiber.deletions;
    if (deletions !== null) {
      for (let i = 0; i < deletions.length; i++) {
        const deletion = deletions[i];
        commitDeletion(deletion);
      }
    }
    fiber.flags &= ~ChildDeletion;
  }
}

function commitPlacement(fiber) {
  const hostParent = getHostParent(fiber);
  appendPlacementNodeToContainer(fiber, hostParent);
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
    if (parentTag === HostRoot) {
      return parent.stateNode.container;
    }
    if (parentTag === HostComponent) {
      return parent.stateNode;
    }
    parent = parent.return;
  }
  console.error("未找到host parent");
  return null;
}

function commitUpdate(fiber) {
  switch (fiber.tag) {
    case HostText:
      return commitTextUpdate(fiber.stateNode, fiber.memoizedProps.content);
    default:
      console.error("commitUpdate未实现的类型");
      return null;
  }
}
/**
 * 删除需要考虑：
 * HostComponent：需要遍历他的子树，为后续解绑ref创造条件，HostComponent本身只需删除最上层节点即可
 * FunctionComponent：effect相关hook的执行，并遍历子树
 */
function commitDeletion(childToDelete) {
  let firstHostFiber = null;
  commitNestedUnmounts(childToDelete, (unmountFiber) => {
    switch (unmountFiber.tag) {
      case HostComponent:
        if (firstHostFiber === null) {
          firstHostFiber = unmountFiber;
        }
        return;
      case FunctionComponent:
        // TODO
        return;
      case HostText:
        if (firstHostFiber === null) {
          firstHostFiber = unmountFiber;
        }
        return;
      default:
        console.error("commitDeletion未实现的类型");
        return;
    }
  });
  if (firstHostFiber !== null) {
    let hostParent = getHostParent(firstHostFiber);
    if (hostParent !== null) {
      removeChild(hostParent, firstHostFiber.stateNode);
    }
  }
  childToDelete.return = null;
  childToDelete.child = null;
}

function commitNestedUnmounts(root, onCommitUnmount) {
  let node = root;
  while (true) {
    onCommitUnmount(node);
    if (node.child !== null) {
      node.child.return = node;
      node = node.child;
      continue;
    }
    if (node === root) {
      return;
    }
    while (node.sibling === null) {
      if (node.return === null || node.return === root) {
        return;
      }
      node = node.return;
    }
    node.sibling.return = node.return;
    node = node.sibling;
  }
}
