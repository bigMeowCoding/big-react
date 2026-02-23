const currentDispatcher = {
  current: null,
};
export const resolveDispatcher = () => {
  const dispatcher = currentDispatcher.current;
  if (dispatcher === null) {
    console.error("resolveDispatcher不存在");
  }
  return dispatcher;
};

export default currentDispatcher;
