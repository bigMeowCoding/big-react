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
function hasValidKey(config) {
  return config.key !== undefined;
}

function hasValidRef(config) {
  return config.ref !== undefined;
}
const jsx = (type, config) => {
  let key = null;
  const props = {};
  let ref = null;
  for (const prop in config) {
    if (hasValidKey(config)) {
      key = config.key;
      continue;
    }
    if (hasValidRef(config)) {
      ref = config.ref;
      continue;
    }
    if (Object.prototype.hasOwnProperty.call(config, prop)) {
      props[prop] = config[prop];
    }
  }

  return ReactElement(type, key, ref, props);
};

export const JsxDEV = jsx;
