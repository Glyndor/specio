// Content script: collects the detection signals already present in the page
// (URL, markup, script URLs, meta tags, cookie names) and forwards them to the
// service worker for matching. It only reads the page; nothing is sent
// off-device. Response headers and the resolved IP are added by the worker
// from the request it already observed — the content script cannot see them.

import type { PageSignals } from "../lib/signals/index.ts";

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
		jsGlobals: [],
	};
}

chrome.runtime.sendMessage({
	type: "page-signals",
	signals: collectSignals(),
});
