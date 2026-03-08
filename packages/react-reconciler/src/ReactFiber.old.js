// Fiber 节点类型常量
export const FunctionComponent = 0;
export const ClassComponent = 1;
export const IndeterminateComponent = 2;
export const HostRoot = 3;
export const HostComponent = 5;
export const HostText = 6;

export function createFiber(tag, pendingProps, key, mode) {
  return {
    tag,
    key,
    elementType: null,
    type: null,
    stateNode: null,
    return: null,
    child: null,
    sibling: null,
    index: 0,
    ref: null,
    pendingProps,
    memoizedProps: null,
    updateQueue: null,
    memoizedState: null,
    flags: 0,
    subtreeFlags: 0,
    alternate: null,
    mode,
  };
}
