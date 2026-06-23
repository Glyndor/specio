// The golden-corpus benchmark. It replays every fixture through the bundled
// ruleset and measures the two metrics that back specio's promises: precision
// (of what was detected, how much is correct — the "fewer false positives"
// headline) and recall (of what is present, how much was caught). The
// thresholds mirror the CI gate defaults (precision >= 0.95, recall >= 0.80).

import { describe, expect, test } from "bun:test";
import { detectTechnologies } from "../../internal/lib/detect/index.ts";
import { FIXTURES } from "../fixtures/index.ts";

const PRECISION_GATE = 0.95;
const RECALL_GATE = 0.8;

describe("golden corpus", () => {
	for (const fixture of FIXTURES) {
		test(`${fixture.expectedId} is detected from its fixture`, () => {
			const detected = detectTechnologies(fixture.signals);
			const hit = detected.find((d) => d.id === fixture.expectedId);
			expect(hit).toBeDefined();
			expect(hit?.confidence).toBe(fixture.expectedConfidence);
			if (fixture.expectedVersion !== undefined) {
				expect(hit?.version).toBe(fixture.expectedVersion);
			}
		});

		test(`${fixture.expectedId} fixture raises no unexpected direct detection`, () => {
			// Implied technologies are inferred, not a false positive; only direct
			// matches other than the expected one count against precision.
			const stray = detectTechnologies(fixture.signals).filter(
				(d) => !d.implied && d.id !== fixture.expectedId,
			);
			expect(stray.map((d) => d.id)).toEqual([]);
		});
	}

	test("precision and recall clear the CI gates", () => {
		let truePositives = 0;
		let directDetections = 0;
		for (const fixture of FIXTURES) {
			const detected = detectTechnologies(fixture.signals);
			const direct = detected.filter((d) => !d.implied);
			directDetections += direct.length;
			if (direct.some((d) => d.id === fixture.expectedId)) {
				truePositives += 1;
			}
		}
		const precision = truePositives / directDetections;
		const recall = truePositives / FIXTURES.length;
		expect(precision).toBeGreaterThanOrEqual(PRECISION_GATE);
		expect(recall).toBeGreaterThanOrEqual(RECALL_GATE);
	});
});
