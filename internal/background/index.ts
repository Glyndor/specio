// Service worker: the thin chrome adapter over the detection logic. It observes
// the response headers of the main document (which the content script cannot
// see), receives page signals from the content script, hands both to the
// DetectionStore, reflects the count on the toolbar badge, and answers the
// popup. webRequest only observes responses the browser already fetched — this
// worker never issues a network request of its own.

import { HeaderCache, normalizeHeaders } from "../lib/headers/index.ts";
import { badgeText, DetectionStore } from "../lib/worker/index.ts";

const store = new DetectionStore();
const headers = new HeaderCache();

/** Paint the detected-technology count on the action badge for a tab. */
function updateBadge(tabId: number, count: number): void {
	chrome.action.setBadgeBackgroundColor({ tabId, color: "#2563eb" });
	chrome.action.setBadgeText({ tabId, text: badgeText(count) });
}

chrome.webRequest.onHeadersReceived.addListener(
	(details) => {
		if (details.tabId >= 0) {
			// `ip` is populated by Chrome on this event but absent from the
			// conservative @types/chrome signature.
			const ip = (details as { ip?: string }).ip;
			headers.set(details.tabId, {
				headers: normalizeHeaders(details.responseHeaders),
				ip,
			});
		}
	},
	{ urls: ["<all_urls>"], types: ["main_frame"] },
	["responseHeaders"],
);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	const type = (message as { type?: unknown })?.type;

	if (type === "page-signals" && sender.tab?.id !== undefined) {
		const detections = store.record(
			sender.tab.id,
			(message as { signals?: unknown }).signals,
			headers.get(sender.tab.id),
		);
		updateBadge(sender.tab.id, detections.length);
		sendResponse({ detections });
		return true;
	}

	if (type === "get-detections") {
		const tabId = (message as { tabId?: unknown }).tabId;
		sendResponse({
			detections: store.get(
				typeof tabId === "number" ? tabId : undefined,
			),
		});
		return true;
	}

	return false;
});

chrome.tabs.onRemoved.addListener((tabId) => {
	store.forget(tabId);
	headers.forget(tabId);
});
