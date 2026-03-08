export function createRoot(container) {
  const root = {
    container,
    current: null,
  };
  return {
    render(children) {
      root.current = children;
      // TODO: 接入 reconciler 进行渲染
      console.log("render", children, "to", container);
    },
  };
}
