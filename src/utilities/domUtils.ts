// The setTimeout with a delay of 200ms ensures that the function is executed after a short delay, allowing React to render the initial DOM elements first. This helps prevent potential issues with accessing DOM elements before they are fully rendered.

export const onDOMReady = (cb: () => void) => {
  if (document.readyState === 'interactive' || document.readyState === 'complete') {
      cb();
  } else {
      document.addEventListener('DOMContentLoaded', cb);
  }
};
