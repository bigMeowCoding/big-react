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
