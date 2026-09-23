import "@testing-library/jest-dom/vitest";

// jsdom에는 ResizeObserver가 없다. 지도(react-zoom-pan-pinch)처럼 크기를 관찰하는
// 컴포넌트가 마운트에서 터지지 않도록 아무것도 하지 않는 구현을 둔다.
if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
}
