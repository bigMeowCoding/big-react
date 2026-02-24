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
    dispatch: null,
  };
  return updateQueue;
};
export const processUpdateQueue = (baseState, updateQueue, fiber) => {
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
    console.error(fiber, "updateQueue is null");
  }
  return baseState;
};
