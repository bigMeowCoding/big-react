export function renderWithHooks(workInProgress) {
  const Component = workInProgress.type;
  const nextChildren = Component(workInProgress.pendingProps);
  return nextChildren;
}
