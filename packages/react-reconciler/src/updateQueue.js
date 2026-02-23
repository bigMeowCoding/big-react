export const createUpdate = (payload) => {
  return { action: payload };
};
export const enqueueUpdate = (updateQueue, update) => {
  updateQueue.shared.pending = update;
};
export const createUpdateQueue = () => {
  const updateQueue = {
    shared: {
      pending: null,
    },
  };
  return updateQueue;
};
export const processUpdateQueue = (fiber) => {
  const updateQueue = fiber.updateQueue;
  let newState = null;
  if (updateQueue !== null) {
    const pending = updateQueue.shared.pending;
    const pendingUpdate = pending;
    updateQueue.shared.pending = null;

    if (pendingUpdate !== null) {
      const action = pendingUpdate.action;
      if (typeof action === "function") {
        newState = action();
      } else {
        newState = action;
      }
    }
  } else {
    console.error(fiber, "updateQueue is null");
  }

  fiber.memoizedState = newState;
};
