function normalizeContent(content) {
  if (content === null || content === undefined) {
    return "";
  }

  if (typeof content === "string" || typeof content === "number") {
    return String(content);
  }

  return JSON.stringify(content);
}

export function createRoot(container) {
  return {
    render(content) {
      container.textContent = normalizeContent(content);
    },
  };
}
