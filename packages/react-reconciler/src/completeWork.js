import { HostRoot, HostComponent, HostText } from "./workTags";
import { createInstance } from "react/src/hostConfig";
import { NoFlags } from "./fiberFlags";
import { appendInitialChild } from "react/src/hostConfig";
import { createTextInstance } from "react/src/hostConfig";

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
    while (node.sibling !== null) {
      node.sibling.return = node.return;
      node = node.sibling;
      continue;
    }
    node = node.return;
  }
}

function bubbleProperties(workInProgress) {
  let subtreeFlags = NoFlags;
  let child = workInProgress.child;
  while (child !== null) {
    subtreeFlags |= child.subtreeFlags;
    child = child.sibling;
  }
  workInProgress.subtreeFlags = subtreeFlags;
}

export function completeWork(workInProgress) {
  switch (workInProgress.tag) {
    case HostRoot: {
      const instance = createInstance(workInProgress.type);
      appendAllChildren(instance, workInProgress);
      workInProgress.stateNode = instance;
      bubbleProperties(workInProgress);
      return null;
    }
    case HostComponent:
      bubbleProperties(workInProgress);
      return null;
    case HostText:
      workInProgress.stateNode = createTextInstance(workInProgress.type);
      bubbleProperties(workInProgress);
      return null;
    default:
      console.log("completeWork未实现", workInProgress.tag);
      return null;
  }
}
