import { describe, expect, test } from "bun:test";
import { CONFIRMED_SCORE, MIN_SCORE, scoreSignals } from "./index.ts";

describe("scoreSignals", () => {
	test("two strong signals confirm via the strong-count rule", () => {
		const { score, confidence } = scoreSignals(["strong", "strong"]);
		expect(confidence).toBe("confirmed");
		expect(score).toBe(1);
	});

	test("one strong signal is only likely", () => {
		const { score, confidence } = scoreSignals(["strong"]);
		expect(confidence).toBe("likely");
		expect(score).toBe(0.5);
	});

	test("one strong plus two weak confirms via the score threshold", () => {
		const { score, confidence } = scoreSignals(["strong", "weak", "weak"]);
		expect(score).toBeGreaterThanOrEqual(CONFIRMED_SCORE);
		expect(confidence).toBe("confirmed");
	});

	test("a single weak signal falls below the floor and is dropped", () => {
		const { score, confidence } = scoreSignals(["weak"]);
		expect(score).toBeLessThan(MIN_SCORE);
		expect(confidence).toBeNull();
	});

	test("no signals score zero and are dropped", () => {
		expect(scoreSignals([])).toEqual({ score: 0, confidence: null });
	});

	test("the score is capped at 1 no matter how many signals match", () => {
		const { score } = scoreSignals([
			"strong",
			"strong",
			"strong",
			"strong",
		]);
		expect(score).toBe(1);
	});

	test("two weak signals reach the likely floor without confirming", () => {
		const { score, confidence } = scoreSignals(["weak", "weak"]);
		expect(score).toBeCloseTo(0.4);
		expect(confidence).toBe("likely");
	});
});
