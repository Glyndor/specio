import { describe, expect, test } from "bun:test";
import { MAX_LIST_LENGTH, parsePageSignals } from "./index.ts";

describe("parsePageSignals", () => {
	test("returns null for a non-object payload", () => {
		expect(parsePageSignals(null)).toBeNull();
		expect(parsePageSignals("nope")).toBeNull();
		expect(parsePageSignals(42)).toBeNull();
	});

	test("coerces a well-formed payload, lowercasing header keys", () => {
		const parsed = parsePageSignals({
			url: "https://x/",
			html: "<html>",
			scripts: ["a.js", 5, "b.js"],
			metas: [{ name: "generator", content: "WordPress" }, "junk"],
			headers: { Server: "nginx", "X-Powered-By": "PHP" },
			cookies: ["PHPSESSID"],
			jsGlobals: ["jQuery"],
		});
		expect(parsed).toEqual({
			url: "https://x/",
			html: "<html>",
			scripts: ["a.js", "b.js"],
			metas: [
				{ name: "generator", content: "WordPress" },
				{ name: null, content: null },
			],
			headers: { server: "nginx", "x-powered-by": "PHP" },
			cookies: ["PHPSESSID"],
			jsGlobals: ["jQuery"],
		});
	});

	test("fills missing or wrong-typed fields with safe empties", () => {
		expect(parsePageSignals({})).toEqual({
			url: "",
			html: "",
			scripts: [],
			metas: [],
			headers: {},
			cookies: [],
			jsGlobals: [],
		});
		expect(
			parsePageSignals({ scripts: "not-an-array", headers: 7 }),
		).toEqual({
			url: "",
			html: "",
			scripts: [],
			metas: [],
			headers: {},
			cookies: [],
			jsGlobals: [],
		});
	});

	test("ignores non-string header values", () => {
		const parsed = parsePageSignals({
			headers: { a: "ok", b: 9, c: null },
		});
		expect(parsed?.headers).toEqual({ a: "ok" });
	});

	test("caps oversized lists from a hostile page", () => {
		const huge = Array.from(
			{ length: MAX_LIST_LENGTH + 500 },
			(_, i) => `s${i}`,
		);
		const parsed = parsePageSignals({ scripts: huge });
		expect(parsed?.scripts.length).toBe(MAX_LIST_LENGTH);
	});
});
