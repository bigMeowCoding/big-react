import { NoFlags } from "./fiberFlags";
import { FunctionComponent, HostComponent } from "./workTags";
import { NoLanes } from "./fiberLanes";

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
    this.lanes = NoLanes;
  }
}

export class FiberRootNode {
  constructor(container, hostRootFiber) {
    this.container = container;
    this.current = hostRootFiber;
    this.finishedWork = null;
    hostRootFiber.stateNode = this;
    this.pendingLanes = NoLanes;
    this.finishedLanes = NoLanes;
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
  wip.lanes = current.lanes;
  return wip;
}
/**
 *
 * @param {ReactElement} element
 * @returns {FiberNode}
 */
export function createFiberFromElement(element) {
  const { type, key, props } = element;
  let fiberTag = FunctionComponent;
  if (typeof type === "string") {
    fiberTag = HostComponent;
  } else if (typeof type !== "function") {
    console.error("未实现的type类型");
  }
  const fiber = new FiberNode(fiberTag, props, key);
  fiber.type = type;
  return fiber;
}
