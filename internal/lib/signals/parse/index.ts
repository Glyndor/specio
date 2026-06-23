// Validates and bounds the page signals arriving from the content script.
// The page is hostile input: a malicious page can drive the content script to
// forward crafted or oversized signals, so the worker never trusts the shape.
// Everything is coerced to the expected type and every list is capped before
// it reaches the matcher.

import type { MetaSignal, PageSignals } from "../index.ts";

/** Maximum number of entries kept from any signal list a page supplies. */
export const MAX_LIST_LENGTH = 2000;

function asString(value: unknown): string {
	return typeof value === "string" ? value : "";
}

function asStringList(value: unknown): string[] {
	if (!Array.isArray(value)) {
		return [];
	}
	return value
		.slice(0, MAX_LIST_LENGTH)
		.filter((item): item is string => typeof item === "string");
}

function asMetaList(value: unknown): MetaSignal[] {
	if (!Array.isArray(value)) {
		return [];
	}
	return value.slice(0, MAX_LIST_LENGTH).map((item) => {
		const meta = (item ?? {}) as Record<string, unknown>;
		return {
			name: typeof meta.name === "string" ? meta.name : null,
			content: typeof meta.content === "string" ? meta.content : null,
		};
	});
}

function asHeaderMap(value: unknown): Record<string, string> {
	if (typeof value !== "object" || value === null) {
		return {};
	}
	const out: Record<string, string> = {};
	for (const [key, raw] of Object.entries(value).slice(0, MAX_LIST_LENGTH)) {
		if (typeof raw === "string") {
			out[key.toLowerCase()] = raw;
		}
	}
	return out;
}

/**
 * Coerce an untrusted message payload into bounded {@link PageSignals}, or
 * `null` when it is not an object at all. Missing or wrong-typed fields become
 * safe empties rather than throwing, so a hostile page cannot crash the worker.
 */
export function parsePageSignals(input: unknown): PageSignals | null {
	if (typeof input !== "object" || input === null) {
		return null;
	}
	const o = input as Record<string, unknown>;
	return {
		url: asString(o.url),
		html: asString(o.html),
		scripts: asStringList(o.scripts),
		metas: asMetaList(o.metas),
		headers: asHeaderMap(o.headers),
		cookies: asStringList(o.cookies),
		jsGlobals: asStringList(o.jsGlobals),
	};
}
