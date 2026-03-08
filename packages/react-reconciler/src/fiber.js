import { NoFlags } from "./fiberFlag";
import { FunctionComponent, HostComponent } from "./workTags";

export class FiberNode {
  constructor(tag, pendingProps, key) {
    this.tag = tag;
    this.key = key;
    this.type = null;
    this.stateNode = null;
    // 状态
    this.pendingProps = pendingProps;
    this.memoizedProps = null;
    this.memoizedState = null;
    this.updateQueue = null;
    // 副作用
    this.flags = NoFlags;
    this.subtreeFlags = NoFlags;
    // 树结构
    this.child = null;
    this.sibling = null;
    this.index = 0;
    this.return = null;
    this.ref = null;
    // 调度
    this.alternate = null;
  }
}

export class FiberRootNode {
  constructor(container, hostRootFiber) {
    this.container = container;
    this.current = hostRootFiber;
    hostRootFiber.stateNode = this;
  }
}

export function createWorkInProgress(current, pendingProps) {
  let workInProgress = current.alternate;
  if (workInProgress === null) {
    workInProgress = new FiberNode(current.tag, pendingProps, current.key);
  }
  return workInProgress;
}

export function createFiberFromElement(element) {
  const { type, key, props } = element;
  let fiberTag = FunctionComponent;
  if (typeof type === "string") {
    fiberTag = HostComponent;
  }
  const fiber = new FiberNode(fiberTag, props, key);
  fiber.type = type;
  return fiber;
}
