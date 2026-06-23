// Presentation logic shared by the popup: turn a flat list of detections into
// category groups in a stable display order. Pure and UI-free so it can be unit
// tested; the popup adds only the DOM and the i18n labels on top.

import type { Detection } from "../fingerprint/match/index.ts";
import type { Category } from "../fingerprint/schema/index.ts";

/** The order categories are shown in — most defining of the stack first. */
export const CATEGORY_ORDER: Category[] = [
	"cms",
	"ecommerce",
	"web-framework",
	"javascript-framework",
	"ui-framework",
	"javascript-library",
	"programming-language",
	"web-server",
	"reverse-proxy",
	"cdn",
	"hosting",
	"tag-manager",
	"analytics",
	"font-script",
];

/** A category and the detections that fall under it. */
export interface CategoryGroup {
	category: Category;
	detections: Detection[];
}

function rank(category: Category): number {
	const index = CATEGORY_ORDER.indexOf(category);
	return index === -1 ? CATEGORY_ORDER.length : index;
}

/**
 * Group detections by their primary (first) category and order the groups by
 * {@link CATEGORY_ORDER}. Within a group, detections keep the order they
 * arrived in (already sorted by score by the matcher).
 */
export function groupByCategory(detections: Detection[]): CategoryGroup[] {
	const groups = new Map<Category, Detection[]>();
	for (const detection of detections) {
		const category = detection.categories[0];
		if (category === undefined) {
			continue;
		}
		const bucket = groups.get(category);
		if (bucket) {
			bucket.push(detection);
		} else {
			groups.set(category, [detection]);
		}
	}
	return [...groups.entries()]
		.map(([category, items]) => ({ category, detections: items }))
		.sort((a, b) => rank(a.category) - rank(b.category));
}
