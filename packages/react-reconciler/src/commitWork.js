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
