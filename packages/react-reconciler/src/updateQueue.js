export function createUpdate(action) {
  return {
    action,
  };
}

export function initializeUpdateQueue(fiber) {
  fiber.updateQueue = {
    shared: {
      pending: null,
    },
  };
}
export function enqueueUpdate(fiber, update) {
  const updateQueue = fiber.updateQueue;
  if (updateQueue !== null) {
    updateQueue.shared.pending = update;
  } else {
    console.warn("updateQueue is null");
  }
}

export function createUpdateQueue() {
  return {
    shared: {
      pending: null,
    },
  };
}
