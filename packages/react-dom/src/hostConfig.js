import { updateFiberProps } from "./SyntheticEvent";

export function createInstance(type, props) {
  const element = document.createElement(type);
  return updateFiberProps(element, props);
}

export function appendInitialChild(parent, child) {
  parent.appendChild(child);
}

export function createTextInstance(content) {
  return document.createTextNode(content);
}
export function appendChildToContainer(container, child) {
  container.appendChild(child);
}

export function commitTextUpdate(textInstance, content) {
  textInstance.nodeValue = content;
}

export function removeChild(parent, child) {
  parent.removeChild(child);
}
export function insertChildToContainer(child, container, before) {
  container.insertBefore(before, child);
}

export const scheduleMicrotask =
  typeof queueMicrotask === "function"
    ? queueMicrotask
    : typeof Promise === "function"
      ? (callback) => Promise.resolve(null).then(callback)
      : () => setTimeout;
