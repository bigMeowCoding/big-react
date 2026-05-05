import { NoFlags } from "./fiberFlags";
import { HostComponent, FunctionComponent } from "./workTags";

export class FiberNode {
  constructor(tag, pendingProps, key) {
    this.tag = tag;
    this.stateNode = null;
    this.key = key;
    this.type = null;
    // 树
    this.child = null;
    this.sibling = null;
    this.return = null;
    this.index = 0;
    this.ref = null;
    // 状态
    this.pendingProps = pendingProps;
    this.memoizedProps = null;
    this.memoizedState = null;
    this.updateQueue = null;
    // 副作用
    this.flags = NoFlags;
    this.subtreeFlags = NoFlags;
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
  let wip = current.alternate;
  if (wip === null) {
    wip = new FiberNode(current.tag, pendingProps, current.key);
    wip.stateNode = current.stateNode;
    wip.alternate = current;
    current.alternate = wip;
  } else {
    wip.pendingProps = pendingProps;
  }

  wip.updateQueue = current.updateQueue;
  wip.flags = current.flags;
  wip.child = current.child;

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
