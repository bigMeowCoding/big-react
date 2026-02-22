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
    // 状态
    this.pendingProps = pendingProps;
    this.memoizedProps = null;
    this.updateQueue = null;
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
