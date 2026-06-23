// Runs in the page's MAIN world (the page's own JS context), which the isolated
// content script cannot reach. Its only job is to read the names of the globals
// the page defined on `window` — which reveal frameworks and libraries that
// expose a global (jQuery, __VUE__, the React devtools hook, …) — and post them
// to the isolated content script. It holds no extension APIs and reads only
// property names, never values.

const MAX_GLOBALS = 500;

const globals = Object.keys(window).slice(0, MAX_GLOBALS);

window.postMessage({ source: "specio:globals", globals }, "*");
