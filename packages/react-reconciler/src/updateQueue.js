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
