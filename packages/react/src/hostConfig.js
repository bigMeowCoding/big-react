export function createInstance(type) {
  return document.createElement(type);
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
