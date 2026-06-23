// Service worker: receives page signals from the content script, runs the
// fingerprint matcher against the bundled ruleset, caches the result per tab,
// and reflects the count on the toolbar badge. Detection is fully local — this
// worker never issues a network request. The page is hostile input, so every
// inbound message is validated and bounded before it reaches the matcher.

import { type Detection, detectTechnologies } from "../lib/detect/index.ts";
import { parsePageSignals } from "../lib/signals/parse/index.ts";

/** Ephemeral, per-tab, local-only cache of the last detection for a tab. */
const byTab = new Map<number, Detection[]>();

/** Render the detected-technology count on the action badge for a tab. */
function updateBadge(tabId: number, count: number): void {
	chrome.action.setBadgeBackgroundColor({ tabId, color: "#2563eb" });
	chrome.action.setBadgeText({
		tabId,
		text: count === 0 ? "" : count > 99 ? "99+" : String(count),
	});
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	const type = (message as { type?: unknown })?.type;

	if (type === "page-signals" && sender.tab?.id !== undefined) {
		const signals = parsePageSignals(
			(message as { signals?: unknown }).signals,
		);
		const detections = signals ? detectTechnologies(signals) : [];
		byTab.set(sender.tab.id, detections);
		updateBadge(sender.tab.id, detections.length);
		sendResponse({ detections });
		return true;
	}

	if (type === "get-detections") {
		const tabId = (message as { tabId?: unknown }).tabId;
		sendResponse({
			detections:
				typeof tabId === "number" ? (byTab.get(tabId) ?? []) : [],
		});
		return true;
	}

	return false;
});

chrome.tabs.onRemoved.addListener((tabId) => {
	byTab.delete(tabId);
});
