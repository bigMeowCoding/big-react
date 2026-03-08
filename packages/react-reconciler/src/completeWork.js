import { NoFlags } from "./fiberFlag";
import { HostComponent, HostRoot } from "./workTags";
import { createInstance, appendInitialChild } from "react-dom/hostConfig";
import { createTextInstance } from "react-dom/hostConfig";
import { HostText } from "./workTags";
export function completeWork(workInProgress) {
  const newProps = workInProgress.pendingProps;

  switch (workInProgress.tag) {
    case HostComponent:
      // 初始化dom
      const instance = createInstance(workInProgress.type);
      // 挂载dom
      appendAllChildren(instance, workInProgress);
      workInProgress.stateNode = instance;
      // 冒泡flag
      bubbleProperties(workInProgress);
      return null;
    case HostRoot:
      // 冒泡flag
      bubbleProperties(workInProgress);
      return null;
    case HostText:
      const text = newProps.content;
      workInProgress.stateNode = createTextInstance(text);
      bubbleProperties(workInProgress);
      return null;
    default:
      console.error("completeWork未实现的类型", workInProgress.tag);
      return null;
  }
}

function appendAllChildren(parent, workInProgress) {
  let node = workInProgress.child;
  while (node !== null) {
    if (node.tag !== HostComponent && node.tag !== HostText) {
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

function bubbleProperties(workInprogress) {
  let subtreeFlags = NoFlags;
  let child = workInprogress.child;
  while (child !== null) {
    subtreeFlags |= child.subtreeFlags;
    subtreeFlags |= child.flags;

    child = child.sibling;
    child.return = workInprogress;
  }
  workInprogress.subtreeFlags = subtreeFlags;
}
