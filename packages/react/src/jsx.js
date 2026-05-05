import { REACT_ELEMENT_TYPE } from "shared/ReactSymbols";

const ReactElement = function (type, key, ref, props) {
  return {
    $$typeof: REACT_ELEMENT_TYPE,
    type,
    key,
    ref,
    props,
    __mark: "zhouyijun",
  };
};
function hasValidKey(config) {
  return config.key !== undefined;
}

function hasValidRef(config) {
  return config.ref !== undefined;
}
export function jsx(type, config, ...maybeChildren) {
  console.log("jsx", type, config, maybeChildren);
  let key = null;
  let props = {};
  let ref = null;
  for (let prop in config) {
    const val = config[prop];
    if (prop === "key") {
      if (hasValidKey(config)) {
        key = "" + val;
        continue;
      }
    } else if (prop === "ref") {
      if (hasValidRef(config)) {
        ref = val;
        continue;
      }
    } else if ({}.hasOwnProperty.call(config, prop)) {
      props[prop] = val;
    }
  }
  return ReactElement(type, key, ref, props);
}

export function isValidElement(element) {
  return typeof element === "object" && element !== null && "type" in element;
}

export function jsxDEV(type, props, ...children) {
  console.log("jsxDEV", type, props, children);
  return jsx(type, props, ...children);
}
