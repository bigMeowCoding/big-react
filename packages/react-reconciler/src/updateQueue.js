export function createUpdateQueue() {
  const updateQueue = {
    shared: {
      pending: null,
    },
    dispatch: null,
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

export function processUpdateQueue(baseState, updateQueue, fiber) {
  if (updateQueue !== null) {
    const pending = updateQueue.shared.pending;
    const pendingUpdate = pending;
    updateQueue.shared.pending = null;
    if (pendingUpdate !== null) {
      const action = pendingUpdate.action;
      if (action instanceof Function) {
        baseState = action(baseState);
      } else {
        baseState = action;
      }
    }
  } else {
    console.error("processUpdateQueue: updateQueue is null");
  }

  return baseState;
}
