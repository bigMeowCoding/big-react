import {
  createContainer,
  updateContainer,
} from "react-reconciler/src/fiberReconciler";

export function createRoot(container) {
  const root = createContainer(container);
  return {
    render(element) {
      updateContainer(element, root);
    },
  };
}
