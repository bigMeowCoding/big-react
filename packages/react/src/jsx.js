export function jsx(type, props, ...children) {
  return {
    type,
    props,
    children,
  };
}

export function isValidElement(element) {
  return typeof element === 'object' && element !== null && 'type' in element;
}

export function jsxDEV(type, props, ...children) {
  return {
    type,
    props,
    children,
  };
}
