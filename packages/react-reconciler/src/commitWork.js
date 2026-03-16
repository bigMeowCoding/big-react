import { ChildDeletion, MutationMask, Update } from "./fiberFlag";
import { NoFlags } from "./fiberFlag";
import { Placement } from "./fiberFlag";
import { HostRoot } from "./workTags";
import { HostComponent } from "./workTags";
import { HostText } from "./workTags";
import { FunctionComponent } from "./workTags";
import { appendChildToContainer } from "react-dom/hostConfig";
import {
  commitTextUpdate,
  removeChild,
  insertChildToContainer,
} from "react-dom/hostConfig";
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
  const hostSibling = getHostSibling(fiber);

  insertOrAppendPlacementNodeIntoContainer(fiber, hostParent, hostSibling);
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
function insertOrAppendPlacementNodeIntoContainer(
  fiber,
  hostParentNode,
  before,
) {
  if (fiber.tag === HostComponent || fiber.tag === HostText) {
    if (before) {
      insertChildToContainer(fiber.stateNode, hostParentNode, before);
    } else {
      appendChildToContainer(fiber.stateNode, hostParentNode);
    }
    return;
  }
  const child = fiber.child;
  if (child !== null) {
    insertOrAppendPlacementNodeIntoContainer(child, hostParentNode, before);
    let sibling = child.sibling;
    while (sibling !== null) {
      insertOrAppendPlacementNodeIntoContainer(sibling, hostParentNode, before);
      sibling = sibling.sibling;
    }
  }
}

/**
 * 难点在于目标fiber的hostSibling可能并不是他的同级sibling
 * 比如： <A/><B/> 其中：function B() {return <div/>} 所以A的hostSibling实际是B的child
 * 实际情况层级可能更深
 * 同时：一个fiber被标记Placement，那他就是不稳定的（他对应的DOM在本次commit阶段会移动），也不能作为hostSibling
 */
function getHostSibling(fiber) {
  let node = fiber;

  findSibling: while (true) {
    while (node.sibling === null) {
      const parent = node.return;
      if (
        parent === null ||
        parent.tag === HostComponent ||
        parent.tag === HostRoot
      ) {
        return null;
      }
      node = parent;
    }
    node.sibling.return = node.return;
    node = node.sibling;
    while (node.tag !== HostComponent && node.tag !== HostText) {
      if ((node.flags & Placement) !== NoFlags) {
        continue findSibling;
      }
      if (node.child === null) {
        continue findSibling;
      } else {
        node.child.return = node;
        node = node.child;
      }
    }
    if ((node.flags & Placement) === NoFlags) {
      return node.stateNode;
    }
  }
}
function getHostParent(fiber) {
  let parent = fiber.return;
  while (parent !== null) {
    const parentTag = parent.tag;
    if (parentTag === HostComponent || parentTag === HostText) {
      return parent.stateNode;
    }
    if (parent.tag === HostRoot) {
      return parent.stateNode.container;
    }
    parent = parent.return;
  }
  console.error("未找到host父节点", fiber);
}
