import { jsx, isValidElement as isValidElementFn } from "./src/jsx.js";
import currentDispatcher from "./src/currentDispatcher.js";
import { resolveDispatcher } from "./src/currentDispatcher.js";
export const createElement = jsx;

export const isValidElement = isValidElementFn;

export function useState(initialState) {
  const dispatcher = resolveDispatcher();

  return dispatcher.useState(initialState);
}

export const __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = {
  currentDispatcher,
};
