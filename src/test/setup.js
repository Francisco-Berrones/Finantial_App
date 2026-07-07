import '@testing-library/jest-dom/vitest'

// framer-motion calls window.matchMedia (prefers-reduced-motion) internally;
// jsdom doesn't implement it, so tests rendering `motion`/`AnimatePresence` would throw without this stub.
if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })
}
