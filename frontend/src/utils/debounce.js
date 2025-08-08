// Simple debounce utility to prevent double function calls
let lastCallTime = 0;
const DEBOUNCE_DELAY = 1000; // 1 second

export const debounce = (func, delay = DEBOUNCE_DELAY) => {
  return function(...args) {
    const now = Date.now();
    if (now - lastCallTime > delay) {
      lastCallTime = now;
      return func.apply(this, args);
    } else {
      console.log('🚫 Debounced - ignoring duplicate call');
      return Promise.resolve();
    }
  };
};
