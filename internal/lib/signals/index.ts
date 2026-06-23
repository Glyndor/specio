// The set of page signals the content script gathers and the matcher reads.
// Everything here is already present in the page or the response the browser
// received — collecting it sends nothing off-device.

import type { SignalSource } from "../fingerprint/schema/index.ts";

/** A `<meta>` tag reduced to the two attributes detection cares about. */
export interface MetaSignal {
	/** The `name` (or `property`) attribute, or `null` when absent. */
	name: string | null;
	/** The `content` attribute, or `null` when absent. */
	content: string | null;
}

/**
 * Everything detection needs from one document (a top frame or a subframe).
 * Header and cookie keys are lowercased by the collector so rules match them
 * case-insensitively without re-normalising.
 */
export interface PageSignals {
	/** The document URL. */
	url: string;
	/** The serialised document markup (bounded by the collector). */
	html: string;
	/** Absolute `src` URLs of every `<script>` on the page. */
	scripts: string[];
	/** Every `<meta>` tag. */
	metas: MetaSignal[];
	/** Response headers, keys lowercased. */
	headers: Record<string, string>;
	/** Cookie names present for the document. */
	cookies: string[];
	/** Names of `window` globals the page defined. */
	jsGlobals: string[];
}

/**
 * Maximum length, in characters, of any single signal value fed to a regex.
 * A hostile page can serve megabytes of markup; bounding every value keeps
 * matching cheap and is the first line of the ReDoS guard.
 */
export const MAX_SIGNAL_LENGTH = 64 * 1024;

/**
 * Clamp a value to {@link MAX_SIGNAL_LENGTH}. Returns the input unchanged when
 * it is already within bounds.
 */
export function clampSignal(value: string): string {
	return value.length > MAX_SIGNAL_LENGTH
		? value.slice(0, MAX_SIGNAL_LENGTH)
		: value;
}

/**
 * Yield the candidate `(value)` strings a pattern of the given source should be
 * tested against, drawn from the collected signals. Keyed sources additionally
 * filter by `key` (case-insensitive). Every yielded value is clamped.
 */
export function valuesForSource(
	signals: PageSignals,
	source: SignalSource,
	key: string | undefined,
): string[] {
	switch (source) {
		case "html":
			return [clampSignal(signals.html)];
		case "url":
			return [clampSignal(signals.url)];
		case "script-src":
			return signals.scripts.map(clampSignal);
		case "js-global":
			return signals.jsGlobals.map(clampSignal);
		case "cookie":
			return key
				? signals.cookies
						.filter(
							(name) => name.toLowerCase() === key.toLowerCase(),
						)
						.map(clampSignal)
				: signals.cookies.map(clampSignal);
		case "meta":
			return signals.metas
				.filter(
					(meta) =>
						!key ||
						(meta.name !== null &&
							meta.name.toLowerCase() === key.toLowerCase()),
				)
				.map((meta) => clampSignal(meta.content ?? ""));
		case "header": {
			if (!key) {
				return Object.values(signals.headers).map(clampSignal);
			}
			const value = signals.headers[key.toLowerCase()];
			return value === undefined ? [] : [clampSignal(value)];
		}
	}
}
