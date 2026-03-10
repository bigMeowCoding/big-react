const currentDispatcher = {
  current: null,
};
export function resolveDispatcher() {
  if (currentDispatcher.current === null) {
    console.error("当前没有dispatcher");
    return null;
  }
  return currentDispatcher.current;
}
export default currentDispatcher;
