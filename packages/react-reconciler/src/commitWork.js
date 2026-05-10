import {
  MutationMask,
  NoFlags,
  Placement,
  Update,
  ChildDeletion,
} from "./fiberFlags";
import {
  HostRoot,
  HostComponent,
  HostText,
  FunctionComponent,
} from "./workTags";
let nextEffect = null;
import {
  appendChildToContainer,
  removeChild,
  commitTextUpdate,
  commitUpdate as commitPropsUpdate,
  insertChildToContainer,
} from "react/src/hostConfig";
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
  if ((flags & ChildDeletion) !== NoFlags) {
    const deletions = finishedWork.deletions;
    deletions.forEach((child) => {
      commitDeletion(child);
    });
    finishedWork.flags &= ~ChildDeletion;
  }
  if ((flags & Update) !== NoFlags) {
    commitUpdate(finishedWork);
    finishedWork.flags &= ~Update;
  }
}
function getHostSibling(finishedWork) {
  let node = finishedWork;
  findSibling: while (true) {
    while (node.sibling === null) {
      const parent = node.return;
      if (
        parent === null ||
        parent.tag === HostComponent ||
        parent.tag === HostText
      ) {
        return null;
      }
      node = parent;
    }
    node.sibling.return = node.return;
    node = node.sibling;
    while (node.tag !== HostComponent && node.tag !== HostText) {
      if ((node.flags & Placement) != NoFlags) {
        continue findSibling;
      }
      if (node.childe === null) {
        continue findSibling;
      } else {
        node.child.return = node;
        node = node.child;
      }
    }
    if ((node.flags & Placement) === NoFlags) {
      return node;
    }
  }
}
function commitPlacement(finishedWork) {
  let hostParent = getHostParent(finishedWork);
  const sibling = getHostSibling(finishedWork);

  insertOrAppendPlacementNodeIntoContainer(finishedWork, hostParent, sibling);
}

function commitDeletion(childToDelete) {
  let firstHostFiber;
  commitNestedUnmount(childToDelete, (unmountFiber) => {
    switch (unmountFiber.tag) {
      case HostComponent:
        if (!firstHostFiber) {
          firstHostFiber = unmountFiber;
        }

        return;
      case HostText:
        if (!firstHostFiber) {
          firstHostFiber = unmountFiber;
        }
        return;
      case FunctionComponent:
        return;
    }
  });
  if (firstHostFiber) {
    const hostParent = getHostParent(firstHostFiber);
    if (hostParent) {
      removeChild(hostParent, firstHostFiber.stateNode);
    }
  }
  childToDelete.return = null;
  childToDelete.child = null;
}
function commitNestedUnmount(root, callback) {
  let node = root;
  while (true) {
    callback(node);
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
function commitUpdate(finishedWork) {
  const { stateNode } = finishedWork;
  switch (finishedWork.tag) {
    case HostComponent: {
      return commitPropsUpdate(stateNode, finishedWork.pendingProps);
    }
    case HostText: {
      const newText = finishedWork.pendingProps.content;
      return commitTextUpdate(stateNode, newText);
    }
    default:
      console.warn("未实现的commitUpdate类型", finishedWork);
      break;
  }
}
function getHostParent(finishedWork) {
  let parent = finishedWork.return;
  while (parent) {
    const parentTag = parent.tag;
    if (parentTag === HostComponent) {
      return parent.stateNode;
    }
    if (parentTag === HostRoot) {
      return parent.stateNode.container;
    }
    parent = parent.return;
  }
  console.warn("未找到hostParent", finishedWork);
  return null;
}

function insertOrAppendPlacementNodeIntoContainer(fiber, hostParent, before) {
  if (fiber.tag === HostComponent || fiber.tag === HostText) {
    if (before) {
      insertChildToContainer(fiber.stateNode, hostParent, before);
    } else {
      appendChildToContainer(hostParent, fiber.stateNode);
    }
    return;
  }
  let child = fiber.child;
  if (child !== null) {
    insertOrAppendPlacementNodeIntoContainer(child, hostParent, before);
    let sibling = child.sibling;
    while (sibling !== null) {
      insertOrAppendPlacementNodeIntoContainer(sibling, hostParent, before);
      sibling = sibling.sibling;
    }
  }
}
