import { describe, expect, test } from "bun:test";
import {
	addedNodeCount,
	isSignificantMutation,
	MUTATION_NODE_THRESHOLD,
} from "./index.ts";

function record(added: number) {
	return { addedNodes: { length: added } };
}

describe("addedNodeCount", () => {
	test("sums added nodes across records", () => {
		expect(addedNodeCount([record(3), record(4), record(0)])).toBe(7);
	});

	test("is zero for no records", () => {
		expect(addedNodeCount([])).toBe(0);
	});
});

describe("isSignificantMutation", () => {
	test("is true at or above the threshold", () => {
		expect(isSignificantMutation([record(MUTATION_NODE_THRESHOLD)])).toBe(
			true,
		);
		expect(isSignificantMutation([record(5), record(6)])).toBe(true);
	});

	test("is false below the threshold", () => {
		expect(isSignificantMutation([record(3), record(2)])).toBe(false);
	});

	test("honours a custom threshold", () => {
		expect(isSignificantMutation([record(2)], 2)).toBe(true);
		expect(isSignificantMutation([record(1)], 2)).toBe(false);
	});
});
