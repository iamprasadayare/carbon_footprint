import "@testing-library/jest-dom";

// Polyfill fetch for Node.js test environment
global.fetch = jest.fn().mockResolvedValue({
  json: jest.fn().mockResolvedValue({}),
  ok: true,
  status: 200,
});

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = String(value); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(window, "localStorage", { value: localStorageMock });
