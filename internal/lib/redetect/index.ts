// Shared knobs and the "is this DOM change worth re-detecting" rule used by the
// content scripts to re-run detection on single-page-app navigation. Kept pure
// (no DOM, no chrome) so the threshold logic is unit tested; the observers and
// debounce wiring live in the content scripts.

/** Debounce window for coalescing re-detection triggers (milliseconds). */
export const REDETECT_DEBOUNCE_MS = 300;

/** Minimum number of added nodes for a DOM mutation to count as significant. */
export const MUTATION_NODE_THRESHOLD = 10;

/** A mutation record reduced to what the threshold rule needs. */
export interface MutationLike {
	addedNodes: ArrayLike<unknown>;
}

/** Total nodes added across a batch of mutation records. */
export function addedNodeCount(records: MutationLike[]): number {
	let count = 0;
	for (const record of records) {
		count += record.addedNodes.length;
	}
	return count;
}

/**
 * Whether a batch of mutations is significant enough to re-detect — at least
 * {@link MUTATION_NODE_THRESHOLD} nodes were added. This keeps re-detection off
 * the hot path of trivial DOM churn so it never hurts page performance.
 */
export function isSignificantMutation(
	records: MutationLike[],
	threshold: number = MUTATION_NODE_THRESHOLD,
): boolean {
	return addedNodeCount(records) >= threshold;
}
