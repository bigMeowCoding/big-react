export function createInstance(type) {
  return document.createElement(type);
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
