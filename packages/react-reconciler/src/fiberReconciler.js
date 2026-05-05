import { HostRoot } from "./workTags";
import { FiberNode, FiberRootNode } from "./fiber";

export function createContainer(container) {
  const hostRootFiber = new FiberNode(HostRoot, {}, null);
  const fiberRoot = new FiberRootNode(container, hostRootFiber);
  initializeUpdateQueue(hostRootFiber);
  return fiberRoot;
}

export function updateContainer(element, root) {
  const hostRootFiber = root.current;
  const update = createUpdate(element);
  enqueueUpdate(hostRootFiber, update);
  scheduleUpdateOnFiber(hostRootFiber);
}
