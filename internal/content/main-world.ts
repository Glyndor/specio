// Runs in the page's MAIN world (the page's own JS context), which the isolated
// content script cannot reach. It reads the names of the globals the page
// defined on `window` — which reveal frameworks and libraries that expose a
// global — and posts them to the isolated content script. It also drives
// re-detection: single-page apps mount frameworks after history-API route
// changes and DOM updates, so it re-posts (debounced) on those events. It holds
// no extension APIs and reads only property names, never values.

import {
	isSignificantMutation,
	REDETECT_DEBOUNCE_MS,
} from "../lib/redetect/index.ts";

const MAX_GLOBALS = 500;

function postGlobals(): void {
	window.postMessage(
		{
			source: "specio:globals",
			globals: Object.keys(window).slice(0, MAX_GLOBALS),
		},
		"*",
	);
}

let timer: ReturnType<typeof setTimeout> | undefined;
function schedule(): void {
	clearTimeout(timer);
	timer = setTimeout(postGlobals, REDETECT_DEBOUNCE_MS);
}

// Initial detection, immediately.
postGlobals();

// Re-detect on history-API route changes (SPA navigation).
for (const method of ["pushState", "replaceState"] as const) {
	const original = history[method].bind(history);
	history[method] = (...args: Parameters<History["pushState"]>) => {
		const result = original(...args);
		schedule();
		return result;
	};
}
window.addEventListener("popstate", schedule);

// Re-detect on significant DOM mutations (widgets mounting after navigation).
new MutationObserver((records) => {
	if (isSignificantMutation(records)) {
		schedule();
	}
}).observe(document.documentElement, { childList: true, subtree: true });
