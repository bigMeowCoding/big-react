export function createInstance(type) {
  return document.createElement(type);
}
export const appendInitialChild = (parent, child) => {
  parent.appendChild(child);
};
