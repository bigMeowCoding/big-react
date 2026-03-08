export function initializeUpdateQueue(fiber) {
  fiber.updateQueue = {
    shared: {
      pending: null,
    },
  };
}

export function createUpdate(action) {
  return {
    action,
  };
}

export function enqueueUpdate(fiber, update) {
  const updateQueue = fiber.updateQueue;
  if (updateQueue === null) {
    return;
  }
  updateQueue.shared.pending = update;
}

export function processUpdateQueue(fiber) {
  const updateQueue = fiber.updateQueue;
  let newState = null;
  if (updateQueue !== null) {
    const pending = updateQueue.shared.pending;
    const pendingUpdate = pending;
    updateQueue.shared.pending = null;
    if (pendingUpdate !== null) {
      const action = pendingUpdate.action;
      if (action instanceof Function) {
        newState = action();
      } else {
        newState = action;
      }
    }
  } else {
    console.error("processUpdateQueue: updateQueue is null");
  }

  fiber.memoizedState = newState;
}
