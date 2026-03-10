import { FiberNode, FiberRootNode } from "./fiber";
import { HostRoot } from "./workTags";
import { createUpdate, enqueueUpdate, createUpdateQueue } from "./updateQueue";
import { scheduleUpdateOnFiber } from "./workLoop";

export function createContainer(container) {
  const hostRootFiber = new FiberNode(HostRoot, {}, null);
  const root = new FiberRootNode(container, hostRootFiber);
  hostRootFiber.updateQueue = createUpdateQueue();
  return root;
}

export function updateContainer(element, root) {
  const hostRootFiber = root.current;
  const update = createUpdate(element);
  enqueueUpdate(hostRootFiber.updateQueue, update);
  scheduleUpdateOnFiber(hostRootFiber);
}
