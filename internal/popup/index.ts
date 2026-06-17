// Popup: renders the technologies detected on the active tab, grouped by
// category. It reads the result from the service worker and pulls no data
// from the network. All user-visible text comes from the i18n layer.

const root = document.getElementById("root");

if (root) {
	root.textContent = chrome.i18n.getMessage("popupEmptyState");
}
