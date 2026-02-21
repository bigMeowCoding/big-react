import { REACT_ELEMENT_TYPE } from "shared/ReactSymbols";

function hasValidKey(config) {
  return config.key !== undefined;
}

function hasValidRef(config) {
  return config.ref !== undefined;
}

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

const jsx = (type, config, maybeKey) => {
  let key = null;
  let ref = null;
  const props = {};

  if (maybeKey !== undefined) {
    key = "" + maybeKey;
  }

  for (const prop in config) {
    if (prop === "key") {
      if (hasValidKey(config)) {
        key = "" + config[prop];
      }
      continue;
    } else if (prop === "ref") {
      if (hasValidRef(config)) {
        ref = config[prop];
      }
      continue;
    } else if ({}.hasOwnProperty.call(config, prop)) {
      props[prop] = config[prop];
    }
  }

  return ReactElement(type, key, ref, props);
};

export const jsxDEV = (...args) => {
  console.log("local jsxDEV called:", args);
  return jsx(...args);
};
