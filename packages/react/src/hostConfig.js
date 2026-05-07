import { updateEventProps } from "react-dom/src/SyntheticEvent";

export function createInstance(type, props) {
  const instance = document.createElement(type);
  updateEventProps(instance, props);
  return instance;
}

export function appendInitialChild(parent, child) {
  parent.appendChild(child);
}

export function appendChildToContainer(parent, child) {
  parent.appendChild(child);
}

export function createTextInstance(text) {
  return document.createTextNode(text);
}
