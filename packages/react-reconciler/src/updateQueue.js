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

export function processUpdateQueue(workInProgress) {
  const queue = workInProgress.updateQueue;
  if (queue !== null) {
    const pending = queue.shared.pending;
    if (pending !== null) {
      queue.shared.pending = null;
      const action = pending.action;
      if (typeof action === "function") {
        workInProgress.memoizedState = action();
      } else {
        workInProgress.memoizedState = action;
      }
    }
  } else {
    console.warn("updateQueue is null");
  }
}
