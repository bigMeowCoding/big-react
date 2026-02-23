import {
  HostRoot,
  HostComponent,
  HostText,
  FunctionComponent,
} from "./workTags";
import { NoFlags } from "./fiberFlags";
import {
  createInstance,
  appendInitialChild,
  createTextInstance,
} from "react-dom/src/hostConfig";

export function completeWork(workInProgress) {
  const newProps = workInProgress.pendingProps;
  switch (workInProgress.tag) {
    case HostRoot:
      bubbleProperties(workInProgress);
      return null;
    case HostComponent:
      //初始化dom
      const instance = createInstance(workInProgress.type);
      //挂载dom
      appendAllChildren(instance, workInProgress);
      workInProgress.stateNode = instance;
      //冒泡副作用
      bubbleProperties(workInProgress);
      return null;
    case HostText:
      //初始化dom
      const textInstance = createTextInstance(newProps.content);
      //挂载dom
      workInProgress.stateNode = textInstance;
      //冒泡副作用
      bubbleProperties(workInProgress);
      return null;
    case FunctionComponent:
      bubbleProperties(workInProgress);
      return null;
    default:
      console.error("completeWork未实现的类型");
      return null;
  }
}

/**
 * @description 冒泡副作用
 * 将子fiber的flags和subtreeFlags冒泡到父fiber，并合并到父fiber的flags和subtreeFlags
 * @param {FiberNode} workInProgress 当前fiber
 */
function bubbleProperties(workInProgress) {
  let subtreeFlags = NoFlags;
  let child = workInProgress.child;
  while (child !== null) {
    subtreeFlags |= child.subtreeFlags;
    subtreeFlags |= child.flags;
    child.return = workInProgress;
    child = child.sibling;
  }
  workInProgress.subtreeFlags |= subtreeFlags;
}

/**
 * @description
 * 遍历当前 fiber 的所有直接和间接子节点，将所有类型为 HostComponent 的 child 对应的 DOM 节点
 * 挂载到 parent 节点下。通过深度优先遍历的方式递归处理 fiber 树。
 *
 *
 * @param {HTMLElement} parent 父dom
 * @param {FiberNode} workInProgress 当前fiber
 */
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
