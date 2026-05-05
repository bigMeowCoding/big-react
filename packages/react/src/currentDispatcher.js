const currentDispatcher = {
  current: null,
};

export default currentDispatcher;

export function resolveDispatcher() {
  const dispatcher = currentDispatcher.current;
  if (dispatcher === null) {
    console.warn("dispatcher is null");
  }
  return dispatcher;
}
