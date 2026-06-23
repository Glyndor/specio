import { describe, expect, test } from "bun:test";
import type { Detection } from "../fingerprint/match/index.ts";
import { CATEGORY_ORDER, groupByCategory } from "./index.ts";

function detection(
	id: string,
	category: Detection["categories"][number],
): Detection {
	return {
		id,
		name: id,
		categories: [category],
		confidence: "confirmed",
		score: 1,
		evidence: [],
		implied: false,
	};
}

describe("groupByCategory", () => {
	test("groups by primary category and orders by CATEGORY_ORDER", () => {
		const groups = groupByCategory([
			detection("ga", "analytics"),
			detection("wp", "cms"),
			detection("nginx", "web-server"),
		]);
		expect(groups.map((g) => g.category)).toEqual([
			"cms",
			"web-server",
			"analytics",
		]);
	});

	test("keeps multiple detections within one category", () => {
		const groups = groupByCategory([
			detection("react", "javascript-framework"),
			detection("vue", "javascript-framework"),
		]);
		expect(groups).toHaveLength(1);
		expect(groups[0].detections.map((d) => d.id)).toEqual(["react", "vue"]);
	});

	test("skips a detection with no category", () => {
		const orphan = {
			...detection("x", "cms"),
			categories: [] as Detection["categories"],
		};
		expect(groupByCategory([orphan])).toEqual([]);
	});

	test("ranks an unknown category last", () => {
		const known = detection("wp", "cms");
		const unknown = {
			...detection("y", "cms"),
			categories: ["mystery"] as unknown as Detection["categories"],
		};
		const groups = groupByCategory([unknown, known]);
		expect(groups[0].category).toBe("cms");
		expect(String(groups[groups.length - 1].category)).toBe("mystery");
	});

	test("CATEGORY_ORDER has no duplicates", () => {
		expect(new Set(CATEGORY_ORDER).size).toBe(CATEGORY_ORDER.length);
	});

	test("an empty input yields no groups", () => {
		expect(groupByCategory([])).toEqual([]);
	});
});
