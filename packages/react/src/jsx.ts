import { REACT_ELEMENT_TYPE } from 'shared/ReactSymbols';
import {
  ElementType,
  Key,
  Props,
  ReactElementType,
  Ref,
} from 'shared/ReactTypes';

const createElement = (
  type: ElementType,
  key: Key,
  ref: Ref,
  props: any
): ReactElementType => {
  return {
    $$typeof: REACT_ELEMENT_TYPE,
    type,
    key,
    ref,
    props,
    __mark: 'jacky',
  };
};

export function jsx(type: ElementType, config: any, ...maybeChildren: any) {
  let key: Key = null;
  let ref: Ref = null;
  const props: Props = {};

  for (const prop in config) {
    if (prop === 'key' && config[prop] !== undefined) {
      key = config.key;
    }
    if (prop === 'ref' && config[prop] !== undefined) {
      ref = config.ref;
    }

    if ({}.hasOwnProperty.call(config, prop)) {
      props[prop] = config[prop];
    }
  }
  const childrenLength = maybeChildren.length;
  if (childrenLength) {
    if (childrenLength === 1) {
      props.children = maybeChildren[0];
    } else {
      props.children = maybeChildren;
    }
  }
  return createElement(type, key, ref, props);
}

export function jsxDev(type: ElementType, config: any) {
  let key: Key = null;
  let ref: Ref = null;
  const props: Props = {};

  for (const prop in config) {
    if (prop === 'key' && config[prop] !== undefined) {
      key = config.key;
    }
    if (prop === 'ref' && config[prop] !== undefined) {
      ref = config.ref;
    }

    if ({}.hasOwnProperty.call(config, prop)) {
      props[prop] = config[prop];
    }
  }
  return createElement(type, key, ref, props);
}
