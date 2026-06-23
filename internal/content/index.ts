// Content script (isolated world): collects the detection signals already
// present in the page (URL, markup, script URLs, meta tags, cookie names) and
// forwards them to the service worker for matching. The page's `window` globals
// live in the MAIN world, so a companion script (main-world.ts) reads their
// names and posts them here; that message is untrusted (the page could forge
// it), so it is validated and bounded. Response headers and the resolved IP are
// added by the worker. It only reads the page; nothing is sent off-device.

import type { PageSignals } from "../lib/signals/index.ts";

/** Maximum number of global names accepted from the MAIN-world message. */
const MAX_GLOBALS = 500;

/** Read the cookie names visible to the document (http-only cookies excluded). */
function cookieNames(): string[] {
	return document.cookie
		.split(";")
		.map((pair) => pair.split("=")[0]?.trim() ?? "")
		.filter((name) => name.length > 0);
}

/** Gather every page-local signal the matcher reads. */
function collectSignals(jsGlobals: string[]): Omit<PageSignals, "headers"> {
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

function send(jsGlobals: string[]): void {
	chrome.runtime.sendMessage({
		type: "page-signals",
		signals: collectSignals(jsGlobals),
	});
}

let sent = false;

// The MAIN-world script posts the page's global names. Validate the message
// (same window, expected shape) and bound it before trusting it.
window.addEventListener("message", (event) => {
	const data = event.data as { source?: unknown; globals?: unknown };
	if (event.source !== window || data?.source !== "specio:globals") {
		return;
	}
	sent = true;
	const globals = Array.isArray(data.globals)
		? data.globals
				.filter((name): name is string => typeof name === "string")
				.slice(0, MAX_GLOBALS)
		: [];
	send(globals);
});

// Fall back to sending without globals if the MAIN-world message never arrives.
setTimeout(() => {
	if (!sent) {
		send([]);
	}
}, 300);
