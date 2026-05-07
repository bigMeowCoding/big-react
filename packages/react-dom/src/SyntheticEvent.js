const validateEventTypeList = ["click"];
const elementEventPropsKey = "__props";

export function initEvent(container, eventType) {
  if (!validateEventTypeList.includes(eventType)) {
    console.warn("Unsupported event type", eventType);
    return;
  }
  container.addEventListener(eventType, (event) => {
    dispatchEvent(container, eventType, event);
  });
}

export function dispatchEvent(container, eventType, event) {
  const { target } = event;
  if (!target) {
    console.warn("target is null");
    return;
  }
  const { bubble, capture } = collectPaths(target, container, eventType);
  const se = createSyntheticEvent(event);
  triggerEventFlow(capture, se);
  if (!se.__stopPropagation) {
    triggerEventFlow(bubble, se);
  }
}
function getEventCallbackNameFromEventType(eventType) {
  return {
    click: ["onClickCapture", "onClick"],
  }[eventType];
}

function collectPaths(target, container, eventType) {
  const paths = { bubble: [], capture: [] };
  while (target !== container) {
    const props = target[elementEventPropsKey];
    if (props) {
      const callbackList = getEventCallbackNameFromEventType(eventType);
      if (callbackList) {
        callbackList.forEach((callbackName, i) => {
          const callback = props[callbackName];
          if (callback) {
            if (i === 0) {
              paths.capture.push(callback);
            } else {
              paths.bubble.push(callback);
            }
          }
        });
      }
    }
    target = target.parentNode;
  }
  return paths;
}

function createSyntheticEvent(event) {
  const syntheticEvent = event;
  syntheticEvent.__stopPropagation = false;
  const originalStopPropagation = event.stopPropagation;
  syntheticEvent.stopPropagation = function () {
    syntheticEvent.__stopPropagation = true;
    originalStopPropagation && originalStopPropagation();
  };

  return syntheticEvent;
}

function triggerEventFlow(paths, se) {
  for (let i = 0; i < paths.length; i++) {
    const path = paths[i];
    path.call(null, se);
    if (se.__stopPropagation) {
      break;
    }
  }
}

export function updateEventProps(node, props) {
  node[elementEventPropsKey] = node[elementEventPropsKey] || {};
  validateEventTypeList.forEach((eventType) => {
    const callbackList = getEventCallbackNameFromEventType(eventType);
    if (callbackList) {
      callbackList.forEach((callbackName) => {
        if (Object.prototype.hasOwnProperty.call(props, callbackName)) {
          node[elementEventPropsKey][callbackName] = props[callbackName];
        }
      });
    }
  });
  return node;
}
