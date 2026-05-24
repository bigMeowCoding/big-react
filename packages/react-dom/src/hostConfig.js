import { updateEventProps } from "./SyntheticEvent";

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

export function removeChild(parent, child) {
  parent.removeChild(child);
}
export function commitTextUpdate(text, newText) {
  text.textContent = newText;
}

export function commitUpdate(instance, props) {
  updateEventProps(instance, props);
}
export const insertChildToContainer = (child, container, before) => {
  container.insertBefore(before, child);
};

export const scheduleMicroTask =
  typeof queueMicrotask === "function"
    ? queueMicrotask
    : typeof Promise === "function"
      ? (callback) => Promise.resolve(null).then(callback)
      : setTimeout;
