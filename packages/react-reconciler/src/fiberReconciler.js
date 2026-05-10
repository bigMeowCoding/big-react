import { HostRoot } from "./workTags";
import { FiberNode, FiberRootNode } from "./fiber";
import {
  createUpdate,
  initializeUpdateQueue,
  enqueueUpdate,
  createUpdateQueue,
} from "./updateQueue";
import { scheduleUpdateOnFiber } from "./workLoop";

export function createContainer(container) {
  const hostRootFiber = new FiberNode(HostRoot, {}, null);
  const fiberRoot = new FiberRootNode(container, hostRootFiber);
  hostRootFiber.updateQueue = createUpdateQueue();
  return fiberRoot;
}

export function updateContainer(element, root) {
  const hostRootFiber = root.current;
  const update = createUpdate(element);
  enqueueUpdate(hostRootFiber.updateQueue, update);
  scheduleUpdateOnFiber(hostRootFiber);
  return element;
}
