if (typeof globalThis.HTMLElement === "undefined") {
  (globalThis as any).HTMLElement = class {};
}
if (typeof globalThis.customElements === "undefined") {
  (globalThis as any).customElements = { define: () => {}, get: () => {} };
}
if (typeof globalThis.window === "undefined") {
  (globalThis as any).window = globalThis;
}