import { describe, expect, test } from "bun:test";
import { STRONG_WEIGHT, WEAK_WEIGHT, weightOf } from "./index.ts";

describe("weightOf", () => {
	test("strong resolves to the strong weight", () => {
		expect(weightOf("strong")).toBe(STRONG_WEIGHT);
	});

	test("weak resolves to the weak weight", () => {
		expect(weightOf("weak")).toBe(WEAK_WEIGHT);
	});

	test("an omitted strength defaults to weak so a signal cannot over-claim", () => {
		expect(weightOf(undefined)).toBe(WEAK_WEIGHT);
	});
});
