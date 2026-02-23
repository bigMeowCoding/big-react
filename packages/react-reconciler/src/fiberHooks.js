export function renderWithHooks(workInProgress) {
  const Component = workInProgress.type;
  const props = workInProgress.pendingProps;
  const children = Component(props);
  return children;
}
