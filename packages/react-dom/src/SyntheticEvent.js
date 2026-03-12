const validateEventTypeList = ["click"];
const elementEventPropsKey = "__props";

export function initEvent(container, type) {
  if (!validateEventTypeList.includes(type)) {
    console.error("Invalid event type", type);
    return;
  }
  container.addEventListener(type, (event) => {
    dispatchEvent(container, type, event);
  });
}
function dispatchEvent(container, type, event) {
  const targetElement = event.target;
  if (!targetElement) {
    console.error("targetElement is not found", event);
    return;
  }
  const { capturePaths, bubblePaths } = collectPaths(
    targetElement,
    container,
    type,
  );
  const se = createSyntheticEvent(event);
  triggerEventFlow(capturePaths, se);
  if (!se.__stopPropagation) {
    triggerEventFlow(bubblePaths, se);
  }
}
function collectPaths(targetElement, container, type) {
  const capturePaths = [];
  const bubblePaths = [];
  let currentElement = targetElement;
  while (currentElement !== null && currentElement !== container) {
    const eventProps = currentElement[elementEventPropsKey];
    if (eventProps) {
      const callbackNameList = getEventCallBackNameFromEventType(type);
      if (callbackNameList) {
        callbackNameList.forEach((callbackName, i) => {
          const callback = eventProps[callbackName];
          if (callback) {
            if (i === 0) {
              capturePaths.push(callback);
            } else {
              bubblePaths.push(callback);
            }
          }
        });
      }
    }
    currentElement = currentElement.parentElement;
  }
  return { capturePaths, bubblePaths };
}
function getEventCallBackNameFromEventType(type) {
  return {
    click: ["onClickCapture", "onClick"],
  }[type];
}

function createSyntheticEvent(event) {
  const se = event;
  se.__stopPropagation = false;
  const originalStopPropagation = event.stopPropagation;
  se.stopPropagation = function () {
    se.__stopPropagation = true;
    originalStopPropagation && originalStopPropagation();
  };
  return se;
}
function triggerEventFlow(paths, se) {
  for (let i = 0; i < paths.length; i++) {
    const path = paths[i];
    path(se);
    if (se.__stopPropagation) {
      break;
    }
  }
}

// 将支持的事件回调保存在DOM中
export function updateFiberProps(element, props) {
  element[elementEventPropsKey] = element[elementEventPropsKey] || {};
  validateEventTypeList.forEach((type) => {
    const callbackNameList = getEventCallBackNameFromEventType(type);
    if (!callbackNameList) {
      return;
    }
    callbackNameList.forEach((callbackName) => {
      if (Object.prototype.hasOwnProperty.call(props, callbackName)) {
        element[elementEventPropsKey][callbackName] = props[callbackName];
      }
    });
  });
  return element;
}
