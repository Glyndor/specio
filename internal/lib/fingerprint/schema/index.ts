// The specio fingerprint rule schema. Designed from scratch (clean-room) and
// deliberately richer than Wappalyzer's: every signal carries its own
// confidence weight, and a rule can express implies/requires/excludes
// relations so the matcher can cross-confirm a stack and cut false positives.

/**
 * A technology category. Category names (not technology names) are the part
 * the UI translates; the identifiers here stay English and stable.
 */
export type Category =
	| "cms"
	| "javascript-framework"
	| "javascript-library"
	| "ui-framework"
	| "web-server"
	| "reverse-proxy"
	| "cdn"
	| "analytics"
	| "tag-manager"
	| "ecommerce"
	| "programming-language"
	| "web-framework"
	| "font-script"
	| "hosting";

/**
 * Where a signal is read from. Every source is already present in the page or
 * the connection the browser made — specio issues no request of its own to
 * gather them.
 */
export type SignalSource =
	| "html"
	| "script-src"
	| "meta"
	| "header"
	| "cookie"
	| "js-global"
	| "url";

/**
 * How telling a single matched signal is. A `strong` signal is hard to fake or
 * remove (a dedicated header, a unique global); a `weak` one is suggestive but
 * common (a generic path fragment).
 */
export type SignalStrength = "strong" | "weak";

/** Confidence weight of a strong signal (see the defaults table). */
export const STRONG_WEIGHT = 0.5;

/** Confidence weight of a weak signal (see the defaults table). */
export const WEAK_WEIGHT = 0.2;

/**
 * Resolve a strength to its numeric weight. Defaults to `weak` when a rule
 * omits the strength, so an unweighted signal can never over-claim.
 */
export function weightOf(strength: SignalStrength | undefined): number {
	return strength === "strong" ? STRONG_WEIGHT : WEAK_WEIGHT;
}

/**
 * One independent way to recognise a technology. Redundancy across several of
 * these — never a single removable one — is what makes detection
 * evasion-resistant.
 */
export interface SignalPattern {
	/** The layer this pattern reads from. */
	source: SignalSource;
	/**
	 * For keyed sources (`meta` name, `header` name, `cookie` name) the key to
	 * match, compared case-insensitively. Ignored for unkeyed sources.
	 */
	key?: string;
	/**
	 * A regular expression (source form, matched case-insensitively) tested
	 * against the signal value. A capture group can extract a version — see
	 * `version`.
	 */
	pattern: string;
	/** How much a match contributes to confidence. Defaults to `weak`. */
	strength?: SignalStrength;
	/**
	 * The 1-based capture-group index that holds the version, when the pattern
	 * extracts one. Omitted when the signal carries no version.
	 */
	version?: number;
}

/**
 * A single technology definition. The matcher accumulates confidence across a
 * rule's `signals`, then applies its relations to the whole detected set.
 */
export interface Rule {
	/** Stable kebab-case identifier, referenced by relations. */
	id: string;
	/** Brand name, shown verbatim and never translated (React stays React). */
	name: string;
	/** One or more categories this technology belongs to. */
	categories: Category[];
	/** Independent recognition signals. At least one is required. */
	signals: SignalPattern[];
	/** Technologies this one implies (e.g. WordPress implies PHP). */
	implies?: string[];
	/** Technologies that must also be detected for this to stand. */
	requires?: string[];
	/** Technologies that cannot coexist with this one (cuts false positives). */
	excludes?: string[];
	/** simple-icons slug for the logo; falls back to a generic icon when absent. */
	icon?: string;
	/** Optional informational URL for the technology. */
	website?: string;
}
