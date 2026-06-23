// Content script (isolated world): collects the detection signals already
// present in the page (URL, markup, script URLs, meta tags, cookie names) and
// forwards them to the service worker for matching. The page's `window` globals
// live in the MAIN world, so a companion script (main-world.ts) reads their
// names and posts them here — initially and again (debounced) on SPA navigation
// and DOM changes. That message is untrusted (the page could forge or replay
// it), so it is validated, bounded, and the resulting detection is debounced to
// at most one run per window. Response headers and the resolved IP are added by
// the worker. It only reads the page; nothing is sent off-device.

import { REDETECT_DEBOUNCE_MS } from "../lib/redetect/index.ts";
import type { PageSignals } from "../lib/signals/index.ts";

/** Maximum number of global names accepted from the MAIN-world message. */
const MAX_GLOBALS = 500;

/** The latest global names received from the MAIN world. */
let jsGlobals: string[] = [];
let timer: ReturnType<typeof setTimeout> | undefined;

/** Read the cookie names visible to the document (http-only cookies excluded). */
function cookieNames(): string[] {
	return document.cookie
		.split(";")
		.map((pair) => pair.split("=")[0]?.trim() ?? "")
		.filter((name) => name.length > 0);
}

/** Gather every page-local signal the matcher reads. */
function collectSignals(): Omit<PageSignals, "headers"> {
	return {
		url: location.href,
		html: document.documentElement.outerHTML,
		scripts: Array.from(document.scripts, (script) => script.src).filter(
			Boolean,
		),
		metas: Array.from(document.head.querySelectorAll("meta"), (meta) => ({
			name: meta.getAttribute("name") ?? meta.getAttribute("property"),
			content: meta.getAttribute("content"),
		})),
		cookies: cookieNames(),
		jsGlobals,
	};
}

/**
 * Re-collect and send, coalesced to at most one run per debounce window. The
 * debounce both batches genuine SPA re-triggers and caps how often a page that
 * spams the globals message can drive detection.
 */
function scheduleSend(): void {
	clearTimeout(timer);
	timer = setTimeout(() => {
		chrome.runtime.sendMessage({
			type: "page-signals",
			signals: collectSignals(),
		});
	}, REDETECT_DEBOUNCE_MS);
}

// The MAIN-world script posts the page's global names (initially and on
// re-detection). Validate the message (same window, expected shape) and bound it.
window.addEventListener("message", (event) => {
	const data = event.data as { source?: unknown; globals?: unknown };
	if (event.source !== window || data?.source !== "specio:globals") {
		return;
	}
	jsGlobals = Array.isArray(data.globals)
		? data.globals
				.filter((name): name is string => typeof name === "string")
				.slice(0, MAX_GLOBALS)
		: [];
	scheduleSend();
});
