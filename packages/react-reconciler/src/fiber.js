import { NoFlags } from "./fiberFlags";

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
