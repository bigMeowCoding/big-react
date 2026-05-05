export function jsx(type, config, ...children) {
  console.log("jsx", type, config, children);
  return {
    type,
    config,
    children,
  };
}

export function isValidElement(element) {
  return typeof element === "object" && element !== null && "type" in element;
}

export function jsxDEV(type, props, ...children) {
  console.log("jsxDEV", type, props, children);
  return {
    type,
    props,
    children,
  };
}
