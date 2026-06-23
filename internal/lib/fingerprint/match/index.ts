// The matcher: page signals × ruleset → detected technologies. It accumulates
// confidence across each rule's independent signals, extracts and cross-checks
// versions, then applies the rule relations (requires / excludes / implies)
// across the whole detected set so the stack cross-confirms itself.

import type { PageSignals } from "../../signals/index.ts";
import { valuesForSource } from "../../signals/index.ts";
import { type Confidence, scoreSignals } from "../confidence/index.ts";
import type {
	Category,
	Rule,
	SignalSource,
	SignalStrength,
} from "../schema/index.ts";
import { extractVersion, resolveVersion } from "../version/index.ts";

/** Longest matched value kept as evidence, so the popup never shows a wall of text. */
const MAX_EVIDENCE_LENGTH = 200;

/** The signal that caused a detection, surfaced as "why detected". */
export interface Evidence {
	/** The layer the signal came from. */
	source: SignalSource;
	/** The key, for keyed sources. */
	key?: string;
	/** The matched value, truncated for display. */
	value: string;
	/** How strongly this signal counted. */
	strength: SignalStrength;
}

/** One technology specio decided is present on the page. */
export interface Detection {
	/** The rule id. */
	id: string;
	/** The brand name, verbatim. */
	name: string;
	/** The technology's categories. */
	categories: Category[];
	/** The resolved version, when a signal exposed one consistently. */
	version?: string;
	/** Confidence level shown to the user. */
	confidence: Confidence;
	/** The weighted score behind the level. */
	score: number;
	/** The signals that matched, for transparency. */
	evidence: Evidence[];
	/** True when the technology was inferred via `implies`, not matched directly. */
	implied: boolean;
	/** simple-icons slug, when the rule has one. */
	icon?: string;
}

interface DirectMatch {
	rule: Rule;
	version?: string;
	confidence: Confidence;
	score: number;
	evidence: Evidence[];
}

function compile(pattern: string): RegExp | null {
	try {
		return new RegExp(pattern, "i");
	} catch {
		// A malformed pattern in the ruleset must never crash detection; skip it.
		return null;
	}
}

function truncate(value: string): string {
	return value.length > MAX_EVIDENCE_LENGTH
		? `${value.slice(0, MAX_EVIDENCE_LENGTH)}…`
		: value;
}

/** Run one rule against the signals, returning a direct match or `null`. */
function matchRule(rule: Rule, signals: PageSignals): DirectMatch | null {
	const strengths: SignalStrength[] = [];
	const versions: string[] = [];
	const evidence: Evidence[] = [];

	for (const signal of rule.signals) {
		const regex = compile(signal.pattern);
		if (!regex) {
			continue;
		}
		const strength: SignalStrength = signal.strength ?? "weak";
		for (const value of valuesForSource(
			signals,
			signal.source,
			signal.key,
		)) {
			const found = value.match(regex);
			if (!found) {
				continue;
			}
			strengths.push(strength);
			evidence.push({
				source: signal.source,
				key: signal.key,
				value: truncate(value),
				strength,
			});
			const version = extractVersion(found, signal.version);
			if (version) {
				versions.push(version);
			}
			break; // one match per pattern is enough; move to the next signal
		}
	}

	if (strengths.length === 0) {
		return null;
	}
	const { score, confidence } = scoreSignals(strengths);
	if (confidence === null) {
		return null;
	}
	return {
		rule,
		version: resolveVersion(versions),
		confidence,
		score,
		evidence,
	};
}

function toDetection(match: DirectMatch, implied: boolean): Detection {
	return {
		id: match.rule.id,
		name: match.rule.name,
		categories: match.rule.categories,
		version: match.version,
		confidence: match.confidence,
		score: match.score,
		evidence: match.evidence,
		implied,
		icon: match.rule.icon,
	};
}

/**
 * Detect the technologies present in `signals` using `rules`. The result is
 * sorted by descending score, with directly-matched technologies ahead of
 * inferred ones at equal score.
 */
export function detect(signals: PageSignals, rules: Rule[]): Detection[] {
	const byId = new Map(rules.map((rule) => [rule.id, rule]));

	// 1. Direct matches.
	const direct = new Map<string, DirectMatch>();
	for (const rule of rules) {
		const match = matchRule(rule, signals);
		if (match) {
			direct.set(rule.id, match);
		}
	}

	// 2. `requires`: drop a detection whose required technology is absent.
	for (const [id, match] of [...direct]) {
		const unmet = (match.rule.requires ?? []).some(
			(req) => !direct.has(req),
		);
		if (unmet) {
			direct.delete(id);
		}
	}

	// 3. `excludes`: when two mutually-exclusive technologies both matched, keep
	//    the higher-scoring one (ties keep the first encountered).
	for (const [id, match] of [...direct]) {
		if (!direct.has(id)) {
			continue;
		}
		for (const other of match.rule.excludes ?? []) {
			const rival = direct.get(other);
			if (rival && rival.score < match.score) {
				direct.delete(other);
			}
		}
	}

	// 4. `implies`: add inferred technologies not already detected directly. A
	//    technology detected both directly and via implies keeps its direct
	//    (stronger, cross-confirmed) match.
	const detections = new Map<string, Detection>();
	for (const match of direct.values()) {
		detections.set(match.rule.id, toDetection(match, false));
	}
	for (const match of direct.values()) {
		for (const impliedId of match.rule.implies ?? []) {
			if (detections.has(impliedId)) {
				continue;
			}
			const rule = byId.get(impliedId);
			if (rule) {
				detections.set(impliedId, {
					id: rule.id,
					name: rule.name,
					categories: rule.categories,
					confidence: "likely",
					score: 0,
					evidence: [],
					implied: true,
					icon: rule.icon,
				});
			}
		}
	}

	return [...detections.values()].sort(
		(a, b) => b.score - a.score || Number(a.implied) - Number(b.implied),
	);
}
