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
    this.deletions = null;
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
    this.finishedWork = null;
    hostRootFiber.stateNode = this;
  }
}

export function createWorkInProgress(current, pendingProps) {
  let wip = current.alternate;
  if (wip === null) {
    wip = new FiberNode(current.tag, pendingProps, current.key);
    wip.type = current.type;
    wip.stateNode = current.stateNode;
    wip.alternate = current;
    current.alternate = wip;
  } else {
    wip.pendingProps = pendingProps;
    wip.flags = NoFlags;
    wip.subtreeFlags = NoFlags;
    wip.deletions = null;
    wip.type = current.type;
  }
  wip.flags = current.flags;
  wip.child = current.child;
  wip.updateQueue = current.updateQueue;

  wip.memoizedProps = current.memoizedProps;
  wip.memoizedState = current.memoizedState;
  return wip;
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
