export function renderWithHooks(workInProgress) {
  const Component = workInProgress.type;
  const children = Component(workInProgress.pendingProps);
  return children;
}
