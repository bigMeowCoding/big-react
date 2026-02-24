// 支持的事件类型
const validEventTypeList = ["click"];
const elementEventPropsKey = "__props";
/**
 * @description 把 React 传进来的事件回调（如 onClick / onClickCapture）缓存到真实 DOM 节点上（__props）
 * 供后续事件系统派发时读取。
 */

export function updateEventProps(node, props) {
  node[elementEventPropsKey] = node[elementEventPropsKey] || {};
  validEventTypeList.forEach((eventType) => {
    const callbackNameList = getEventCallbackNameFromEventType(eventType);
    if (!callbackNameList) {
      return;
    }
    callbackNameList.forEach((callbackName) => {
      if (Object.hasOwnProperty.call(props, callbackName)) {
        node[elementEventPropsKey][callbackName] = props[callbackName];
      }
    });
  });
  return node;
}

function getEventCallbackNameFromEventType(eventType) {
  return {
    click: ["onClick", "onClickCapture"],
  }[eventType];
}

export function initEvent(container, eventType) {
  if (!validEventTypeList.includes(eventType)) {
    console.warn("当前不支持的事件类型", eventType);
    return;
  }
  container.addEventListener(eventType, (event) => {
    dispatchEvent(container, eventType, event);
  });
}

function dispatchEvent(container, eventType, event) {
  const { target } = event;
  if (!target) {
    console.warn("事件不存在 target", event);
    return;
  }
  const { capture, bubble } = collectPaths(target, container, eventType);
  const se = createSyntheticEvent(event);
  triggerEventFlow(capture, se);
  if (!se.__stopPropagation) {
    triggerEventFlow(bubble, se);
  }
}

function collectPaths(target, container, eventType) {
  const paths = {
    capture: [],
    bubble: [],
  };

  let parent = target.parentElement;
  while (parent !== container) {
    const eventProps = target[elementEventPropsKey];
    if (eventProps) {
      const callbackNameList = getEventCallbackNameFromEventType(eventType);
      if (callbackNameList) {
        callbackNameList.forEach((callbackName, i) => {
          if (eventProps[callbackName]) {
            if (i === 0) {
              paths.capture.push(parent);
            } else {
              paths.bubble.push(parent);
            }
          }
        });
      }
    }
    parent = parent.parentNode;
  }
  return paths;
}

function createSyntheticEvent(event) {
  const se = event;
  se.__stopPropagation = false;
  const originalStopPropagation = event.stopPropagation;
  se.stopPropagation = () => {
    se.__stopPropagation = true;

    originalStopPropagation && originalStopPropagation.call(event);
  };
  return se;
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
