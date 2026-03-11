export function createInstance(type) {
  return document.createElement(type);
}
export const appendInitialChild = (parent, child) => {
  parent.appendChild(child);
};
export const appendChildToContainer = (child, parent) => {
  parent.appendChild(child);
};
export const createTextInstance = (content) => {
  return document.createTextNode(content);
};

export const removeChild = (child, parent) => {
  parent.removeChild(child);
};

export const commitTextUpdate = (textInstance, content) => {
  textInstance.textContent = content;
};
