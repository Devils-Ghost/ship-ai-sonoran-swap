import "@testing-library/jest-dom/vitest";

// Radix primitives measure elements; jsdom has no ResizeObserver.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver ??= ResizeObserverStub;

// Vitest globals are off, so Testing Library can't register its own cleanup.
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
afterEach(cleanup);

// jsdom has no matchMedia; components only ask about reduced motion.
if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}
