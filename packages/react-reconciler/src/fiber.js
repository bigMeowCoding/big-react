import { NoFlags } from "./fiberFlags";

export class FiberNode {
  constructor(tag, pendingProps, key) {
    this.tag = tag;
    this.key = key;
    this.stateNode = null;
    this.type = null;

    // 树结构
    this.return = null;
    this.sibling = null;
    this.child = null;
    this.index = 0;
    this.ref = null;

    // 状态
    this.pendingProps = pendingProps;
    this.memoizedProps = null;
    this.updateQueue = null;
    this.memoizedState = null;

    // 副作用
    this.flags = NoFlags;
    this.subtreeFlags = NoFlags;
    //调度
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
    wip.type = current.type;
    wip.alternate = current;
    current.alternate = wip;
  } else {
    wip.pendingProps = pendingProps;
  }
  wip.updateQueue = current.updateQueue;
  wip.memoizedState = current.memoizedState;
  wip.memoizedProps = current.memoizedProps;
  wip.flags = current.flags;
  wip.child = current.child;
  return wip;
}
