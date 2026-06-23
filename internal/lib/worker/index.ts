// The service worker's detection logic, kept out of the chrome glue so it can
// be unit tested. A DetectionStore holds the ephemeral, per-tab, local-only
// cache; badgeText renders the toolbar count. The worker itself only wires
// these to chrome's message, action, and tab events.

import { type Detection, detectTechnologies } from "../detect/index.ts";
import { parsePageSignals } from "../signals/parse/index.ts";

/** Highest exact number shown on the badge before it switches to "99+". */
export const MAX_BADGE_COUNT = 99;

/**
 * Render the badge label for a detection count: empty when nothing was found,
 * the exact number up to {@link MAX_BADGE_COUNT}, then "99+".
 */
export function badgeText(count: number): string {
	if (count <= 0) {
		return "";
	}
	return count > MAX_BADGE_COUNT ? `${MAX_BADGE_COUNT}+` : String(count);
}

/**
 * The per-tab detection cache. It is in-memory only (never persisted or
 * synced), so it is naturally ephemeral and local — closing the tab or the
 * worker drops it.
 */
export class DetectionStore {
	private readonly byTab = new Map<number, Detection[]>();

	/**
	 * Validate and bound an untrusted signals payload, detect, cache the result
	 * for the tab, and return it. A payload that is not an object yields an
	 * empty result rather than throwing.
	 */
	record(tabId: number, rawSignals: unknown): Detection[] {
		const signals = parsePageSignals(rawSignals);
		const detections = signals ? detectTechnologies(signals) : [];
		this.byTab.set(tabId, detections);
		return detections;
	}

	/** The cached detections for a tab, or an empty list when none/unknown. */
	get(tabId: number | undefined): Detection[] {
		return typeof tabId === "number" ? (this.byTab.get(tabId) ?? []) : [];
	}

	/** Drop a tab's cache (on tab close). */
	forget(tabId: number): void {
		this.byTab.delete(tabId);
	}

	/** Number of tabs currently cached. */
	get size(): number {
		return this.byTab.size;
	}
}
