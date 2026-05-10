import { HostRoot, HostComponent, HostText } from "./workTags";
import { createInstance } from "react/src/hostConfig";
import { NoFlags, Update } from "./fiberFlags";
import { appendInitialChild } from "react/src/hostConfig";
import { createTextInstance } from "react/src/hostConfig";
import { FunctionComponent } from "./workTags";

function appendAllChildren(parent, workInProgress) {
  let node = workInProgress.child;

  while (node !== null) {
    if (node.tag === HostComponent || node.tag === HostText) {
      appendInitialChild(parent, node.stateNode);
    } else if (node.child !== null) {
      node.child.return = node;
      node = node.child;
      continue;
    }

    if (node === workInProgress) {
      return;
    }
    while (node.sibling === null) {
      if (node.return === null || node.return === workInProgress) {
        return;
      }
      node = node.return;
    }
    node.sibling.return = node.return;
    node = node.sibling;
  }
}

function bubbleProperties(workInProgress) {
  let subtreeFlags = NoFlags;
  let child = workInProgress.child;
  while (child !== null) {
    subtreeFlags |= child.subtreeFlags;
    subtreeFlags |= child.flags;
    child = child.sibling;
  }
  workInProgress.subtreeFlags = subtreeFlags;
}

export function completeWork(workInProgress) {
  const { type, pendingProps } = workInProgress;
  switch (workInProgress.tag) {
    case HostComponent: {
      const current = workInProgress.alternate;
      if (current !== null && workInProgress.stateNode !== null) {
        // todo
      } else {
        const instance = createInstance(type, pendingProps);
        appendAllChildren(instance, workInProgress);
        workInProgress.stateNode = instance;
      }

      bubbleProperties(workInProgress);
      return null;
    }
    case HostRoot:
      console.log("completeWork HostRoot", workInProgress);
      bubbleProperties(workInProgress);
      return null;
    case HostText: {
      const current = workInProgress.alternate;
      if (current !== null && workInProgress.stateNode) {
        const oldText = current.memoizedProps.content;
        const newText = workInProgress.pendingProps.content;
        if (oldText !== newText) {
          markUpdate(workInProgress);
        }
      } else {
        workInProgress.stateNode = createTextInstance(
          workInProgress.pendingProps.content
        );
      }
      bubbleProperties(workInProgress);
      return null;
    }
    case FunctionComponent: {
      bubbleProperties(workInProgress);
      return null;
    }
    default:
      console.log("completeWork未实现", workInProgress.tag);
      return null;
  }
}

function markUpdate(workInProgress) {
  workInProgress.flags |= Update;
}
