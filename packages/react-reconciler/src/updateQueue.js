export const createUpdate = (payload) => {
  return { action: payload };
};
export const enqueueUpdate = (fiber, update) => {
  const updateQueue = fiber.updateQueue;
  if (updateQueue !== null) {
    updateQueue.shared.pending = update;
  }
};
export const initialUpdateQueue = (fiber) => {
  fiber.updateQueue = {
    shared: {
      pending: null,
    },
  };
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
