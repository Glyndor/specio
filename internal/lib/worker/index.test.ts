import { describe, expect, test } from "bun:test";
import { badgeText, DetectionStore, MAX_BADGE_COUNT } from "./index.ts";

const wordpressSignals = {
	url: "https://example.com/",
	html: "<a href='/wp-content/'></a><b>/wp-includes/</b>",
	scripts: [],
	metas: [{ name: "generator", content: "WordPress 6.4.2" }],
	headers: {},
	cookies: [],
	jsGlobals: [],
};

describe("badgeText", () => {
	test("is empty for zero", () => {
		expect(badgeText(0)).toBe("");
	});

	test("is the exact count up to the cap", () => {
		expect(badgeText(1)).toBe("1");
		expect(badgeText(MAX_BADGE_COUNT)).toBe("99");
	});

	test("caps at 99+ beyond the cap", () => {
		expect(badgeText(MAX_BADGE_COUNT + 1)).toBe("99+");
		expect(badgeText(500)).toBe("99+");
	});

	test("treats a negative count as empty", () => {
		expect(badgeText(-3)).toBe("");
	});
});

describe("DetectionStore", () => {
	test("records, detects, and caches per tab", () => {
		const store = new DetectionStore();
		const detections = store.record(7, wordpressSignals);
		expect(detections.some((d) => d.id === "wordpress")).toBe(true);
		expect(store.get(7)).toEqual(detections);
		expect(store.size).toBe(1);
	});

	test("an unknown or undefined tab returns an empty list", () => {
		const store = new DetectionStore();
		expect(store.get(999)).toEqual([]);
		expect(store.get(undefined)).toEqual([]);
	});

	test("a non-object payload yields an empty result without throwing", () => {
		const store = new DetectionStore();
		expect(store.record(1, "garbage")).toEqual([]);
		expect(store.get(1)).toEqual([]);
	});

	test("merges captured response headers so header-only rules fire", () => {
		const store = new DetectionStore();
		// Page signals alone (no headers) would not detect Nginx or PHP.
		const detections = store.record(
			2,
			{ ...wordpressSignals, html: "" },
			{
				headers: {
					server: "nginx/1.25.3",
					"x-powered-by": "PHP/8.2.0",
				},
			},
		);
		const ids = detections.map((d) => d.id);
		expect(ids).toContain("nginx");
		expect(ids).toContain("php");
		expect(detections.find((d) => d.id === "nginx")?.version).toBe(
			"1.25.3",
		);
	});

	test("captured headers do not break detection when signals are garbage", () => {
		const store = new DetectionStore();
		expect(
			store.record(8, "garbage", { headers: { server: "nginx" } }),
		).toEqual([]);
	});

	test("forget drops a tab's cache", () => {
		const store = new DetectionStore();
		store.record(3, wordpressSignals);
		store.forget(3);
		expect(store.get(3)).toEqual([]);
		expect(store.size).toBe(0);
	});

	test("re-recording a tab replaces its previous result", () => {
		const store = new DetectionStore();
		store.record(5, wordpressSignals);
		store.record(5, { ...wordpressSignals, html: "", metas: [] });
		expect(store.get(5).some((d) => d.id === "wordpress")).toBe(false);
		expect(store.size).toBe(1);
	});
});
