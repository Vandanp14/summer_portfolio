// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// jsdom has no matchMedia. Provide one that reports reduced motion so the app
// (and GSAP's ScrollTrigger registration) take the static, browser-free path.
if (typeof window.matchMedia !== 'function') {
  window.matchMedia = (query) => ({
    matches: /prefers-reduced-motion/i.test(query),
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}
