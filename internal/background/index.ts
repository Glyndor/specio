// Service worker: receives page signals from the content script and runs
// fingerprint matching against the technology ruleset. Detection is fully
// local — this worker never issues network requests.

interface PageSignalsMessage {
	type: "page-signals";
	signals: unknown;
}

function isPageSignalsMessage(message: unknown): message is PageSignalsMessage {
	return typeof message === "object" && message !== null && (message as { type?: unknown }).type === "page-signals";
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
	if (isPageSignalsMessage(message)) {
		// TODO: match message.signals against the fingerprint ruleset and
		// return the detected technologies grouped by category.
		sendResponse({ technologies: [] });
	}

	return true;
});
