// Popup: renders the technologies detected on the active tab, grouped by
// category. It reads the result from the service worker and pulls no data from
// the network. All user-visible text comes from the i18n layer; technology
// names stay verbatim. Detection fields originate from the page, so they are
// only ever written via textContent — never innerHTML — to keep a hostile page
// from injecting markup into the popup.

import type { Detection } from "../lib/detect/index.ts";
import { type CategoryGroup, groupByCategory } from "../lib/present/index.ts";

const root = document.getElementById("root");

function t(key: string): string {
	return chrome.i18n.getMessage(key);
}

function categoryLabel(category: string): string {
	return t(`category_${category.replace(/-/g, "_")}`) || category;
}

function renderDetection(detection: Detection): HTMLElement {
	const item = document.createElement("li");
	item.className = "tech";

	const name = document.createElement("span");
	name.className = "tech-name";
	name.textContent = detection.version
		? `${detection.name} ${detection.version}`
		: detection.name;
	item.append(name);

	const badge = document.createElement("span");
	badge.className = `confidence confidence-${detection.confidence}`;
	badge.textContent = detection.implied
		? t("popupImplied")
		: t(`confidence_${detection.confidence}`);
	item.append(badge);

	return item;
}

function renderGroup(group: CategoryGroup): HTMLElement {
	const section = document.createElement("section");
	section.className = "group";

	const heading = document.createElement("h2");
	heading.textContent = categoryLabel(group.category);
	section.append(heading);

	const list = document.createElement("ul");
	for (const detection of group.detections) {
		list.append(renderDetection(detection));
	}
	section.append(list);
	return section;
}

function render(detections: Detection[]): void {
	if (!root) {
		return;
	}
	root.replaceChildren();
	if (detections.length === 0) {
		const empty = document.createElement("p");
		empty.className = "empty";
		empty.textContent = t("popupEmptyState");
		root.append(empty);
		return;
	}
	for (const group of groupByCategory(detections)) {
		root.append(renderGroup(group));
	}
}

async function load(): Promise<void> {
	const [tab] = await chrome.tabs.query({
		active: true,
		currentWindow: true,
	});
	const response = (await chrome.runtime.sendMessage({
		type: "get-detections",
		tabId: tab?.id,
	})) as { detections?: Detection[] } | undefined;
	render(response?.detections ?? []);
}

void load();
