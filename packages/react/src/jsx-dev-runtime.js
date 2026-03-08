import { REACT_ELEMENT_TYPE } from "shared/ReactSymbols";

const ReactElement = function (type, key, ref, props) {
  return {
    $$typeof: REACT_ELEMENT_TYPE,
    __mark: "jacky",
    type,
    key,
    ref,
    props,
  };
};

// React 17+ automatic JSX runtime
export function jsxDEV(type, config, maybeKey, isStaticChildren, source, self) {
  let key = null;
  const props = {};
  let ref = null;
  if (config != null) {
    if (typeof config.ref !== "undefined") {
      ref = config.ref;
    }
    if (typeof config.key !== "undefined") {
      key = "" + config.key;
    }
    for (const propName in config) {
      if (
        propName !== "key" &&
        propName !== "ref" &&
        Object.prototype.hasOwnProperty.call(config, propName)
      ) {
        props[propName] = config[propName];
      }
    }
  }
  if (maybeKey !== undefined) {
    key = "" + maybeKey;
  }
  return ReactElement(type, key, ref, props);
}

export function jsxs(type, config, maybeKey) {
  return jsxDEV(type, config, maybeKey, true);
}

export const Fragment = Symbol.for("react.fragment");
