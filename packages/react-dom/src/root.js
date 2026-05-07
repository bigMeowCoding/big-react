import {
  createContainer,
  updateContainer,
} from "react-reconciler/src/fiberReconciler";
import { initEvent } from "./SyntheticEvent";

export function createRoot(container) {
  const root = createContainer(container);
  return {
    render(element) {
      initEvent(container, "click");
      updateContainer(element, root);
    },
  };
}
