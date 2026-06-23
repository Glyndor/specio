// Turns the set of signals that matched a rule into a confidence score and a
// human-facing level. The thresholds are the project defaults: a detection is
// `confirmed` when two independent strong signals agree (or the weighted score
// reaches 0.8), `likely` on a single strong signal, and is not surfaced at all
// below 0.4 — this is how specio keeps "fewer false positives than Wappalyzer".

import {
	type SignalStrength,
	STRONG_WEIGHT,
	weightOf,
} from "../schema/index.ts";

/** The confidence level shown next to a detection. */
export type Confidence = "likely" | "confirmed";

/** Score at or above which a detection is `confirmed`. */
export const CONFIRMED_SCORE = 0.8;

/** Score at or above which a detection is surfaced at all. */
export const MIN_SCORE = 0.4;

/** Number of strong signals that alone make a detection `confirmed`. */
export const CONFIRMED_STRONG_COUNT = 2;

/** The outcome of scoring a rule's matched signals. */
export interface Score {
	/** Summed signal weights, capped at 1. */
	score: number;
	/** The resolved level, or `null` when the detection is below the floor. */
	confidence: Confidence | null;
}

/**
 * Score a rule from the strengths of the signals that matched it. The score is
 * the sum of the matched weights capped at 1; the level is `confirmed` when at
 * least {@link CONFIRMED_STRONG_COUNT} strong signals matched or the score
 * reaches {@link CONFIRMED_SCORE}, `likely` from {@link MIN_SCORE} up, and
 * `null` below it (caller drops the detection).
 */
export function scoreSignals(strengths: SignalStrength[]): Score {
	const raw = strengths.reduce((sum, s) => sum + weightOf(s), 0);
	const score = Math.min(raw, 1);
	const strongCount = strengths.filter(
		(s) => weightOf(s) >= STRONG_WEIGHT,
	).length;

	if (strongCount >= CONFIRMED_STRONG_COUNT || score >= CONFIRMED_SCORE) {
		return { score, confidence: "confirmed" };
	}
	if (score >= MIN_SCORE) {
		return { score, confidence: "likely" };
	}
	return { score, confidence: null };
}
