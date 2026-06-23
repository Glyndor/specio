// Service worker: the thin chrome adapter over the detection logic. It receives
// page signals from the content script, hands them to the DetectionStore (which
// validates, bounds, detects, and caches per tab), reflects the count on the
// toolbar badge, and answers the popup. Detection is fully local — this worker
// never issues a network request.

import { badgeText, DetectionStore } from "../lib/worker/index.ts";

const store = new DetectionStore();

/** Paint the detected-technology count on the action badge for a tab. */
function updateBadge(tabId: number, count: number): void {
	chrome.action.setBadgeBackgroundColor({ tabId, color: "#2563eb" });
	chrome.action.setBadgeText({ tabId, text: badgeText(count) });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	const type = (message as { type?: unknown })?.type;

	if (type === "page-signals" && sender.tab?.id !== undefined) {
		const detections = store.record(
			sender.tab.id,
			(message as { signals?: unknown }).signals,
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
});
