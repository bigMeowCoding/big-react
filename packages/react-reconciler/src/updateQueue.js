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

export function processUpdateQueue(baseState, queue, workInProgress) {
  if (queue !== null) {
    const pending = queue.shared.pending;
    if (pending !== null) {
      queue.shared.pending = null;
      const action = pending.action;
      if (typeof action === "function") {
        baseState = action(baseState);
      } else {
        baseState = action;
      }
    }
  } else {
    console.warn("updateQueue is null");
  }
  return baseState;
}
