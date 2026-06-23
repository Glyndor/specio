// Version extraction and cross-checking. specio reports the actual version
// running on the page, pulled from whichever signal exposes it and
// cross-checked across signals: if sources agree (or only one speaks) that
// version is reported; if they disagree, the name is reported without a
// version rather than guessing.

/**
 * Pick the version to report from every version string the matched signals
 * yielded. Returns `undefined` when no signal carried a version or when the
 * non-empty versions disagree.
 */
export function resolveVersion(candidates: string[]): string | undefined {
	const seen = candidates
		.map((value) => value.trim())
		.filter((value) => value.length > 0);

	if (seen.length === 0) {
		return undefined;
	}

	const unique = [...new Set(seen)];
	return unique.length === 1 ? unique[0] : undefined;
}

/**
 * Extract the version captured by a pattern match, if the rule declared a
 * capture group for it. `group` is 1-based to match how the rule author counts
 * parentheses; an out-of-range or empty capture yields `undefined`.
 */
export function extractVersion(
	match: RegExpMatchArray,
	group: number | undefined,
): string | undefined {
	if (group === undefined || group < 1 || group >= match.length) {
		return undefined;
	}
	const captured = match[group];
	return captured && captured.length > 0 ? captured : undefined;
}
