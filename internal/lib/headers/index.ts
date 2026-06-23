// Response-header capture for the service worker. The content script cannot see
// response headers, so the worker observes them with webRequest and hands them
// here. Observing a response the browser already fetched makes no request of
// specio's own — the basic tier stays zero-network. This module is pure (no
// chrome) so it is unit tested; the worker only feeds it webRequest data.

/** A response header as webRequest reports it. */
export interface RawHeader {
	name: string;
	value?: string;
}

/** What the worker captures for a tab's main document. */
export interface CapturedResponse {
	/** Response headers, names lowercased. */
	headers: Record<string, string>;
	/** The resolved server IP, when the browser exposed it. */
	ip?: string;
}

/** Maximum number of response headers kept (bounds a hostile server). */
export const MAX_HEADERS = 200;

/**
 * Normalise webRequest response headers into a lowercased-key map. Duplicate
 * headers are joined with ", " (as HTTP allows). Headers past {@link MAX_HEADERS}
 * are dropped.
 */
export function normalizeHeaders(
	raw: RawHeader[] | undefined,
): Record<string, string> {
	const out: Record<string, string> = {};
	if (!raw) {
		return out;
	}
	for (const header of raw.slice(0, MAX_HEADERS)) {
		if (
			typeof header?.name !== "string" ||
			typeof header.value !== "string"
		) {
			continue;
		}
		const key = header.name.toLowerCase();
		out[key] = key in out ? `${out[key]}, ${header.value}` : header.value;
	}
	return out;
}

/**
 * Per-tab cache of the latest captured main-document response. Like the
 * detection cache it is in-memory only and dropped when the tab closes.
 */
export class HeaderCache {
	private readonly byTab = new Map<number, CapturedResponse>();

	/** Store the captured response for a tab. */
	set(tabId: number, response: CapturedResponse): void {
		this.byTab.set(tabId, response);
	}

	/** The captured response for a tab, or `undefined` when none. */
	get(tabId: number): CapturedResponse | undefined {
		return this.byTab.get(tabId);
	}

	/** Drop a tab's captured response (on tab close). */
	forget(tabId: number): void {
		this.byTab.delete(tabId);
	}
}
