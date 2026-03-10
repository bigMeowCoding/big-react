export function createUpdateQueue() {
  const updateQueue = {
    shared: {
      pending: null,
    },
  };
  return updateQueue;
}

export function createUpdate(action) {
  return {
    action,
  };
}

export function enqueueUpdate(updateQueue, update) {
  updateQueue.shared.pending = update;
}

export function processUpdateQueue(fiber) {
  const updateQueue = fiber.updateQueue;
  let newState = fiber.memoizedState;

  if (updateQueue !== null) {
    const pending = updateQueue.shared.pending;
    const pendingUpdate = pending;
    updateQueue.shared.pending = null;
    if (pendingUpdate !== null) {
      const action = pendingUpdate.action;
      if (action instanceof Function) {
        newState = action(newState);
      } else {
        newState = action;
      }
    }
  } else {
    console.error("processUpdateQueue: updateQueue is null");
  }

  fiber.memoizedState = newState;
}
