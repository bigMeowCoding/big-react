export function createRoot(container) {
  return {
    render(content) {
      container.textContent = normalizeContent(content);
    },
  };
}
