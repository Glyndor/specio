import { describe, expect, test } from "bun:test";
import { HeaderCache, MAX_HEADERS, normalizeHeaders } from "./index.ts";

describe("normalizeHeaders", () => {
	test("lowercases names and keeps values", () => {
		expect(
			normalizeHeaders([
				{ name: "Server", value: "nginx/1.25.3" },
				{ name: "X-Powered-By", value: "PHP/8.2.0" },
			]),
		).toEqual({ server: "nginx/1.25.3", "x-powered-by": "PHP/8.2.0" });
	});

	test("joins duplicate headers with a comma", () => {
		expect(
			normalizeHeaders([
				{ name: "Via", value: "1.1 a" },
				{ name: "via", value: "1.1 b" },
			]),
		).toEqual({ via: "1.1 a, 1.1 b" });
	});

	test("returns an empty map for undefined", () => {
		expect(normalizeHeaders(undefined)).toEqual({});
	});

	test("skips headers without a string value or name", () => {
		expect(
			normalizeHeaders([
				{ name: "Server", value: "nginx" },
				{ name: "X-Empty" },
				{ name: 5 as unknown as string, value: "x" },
			]),
		).toEqual({ server: "nginx" });
	});

	test("caps the number of headers", () => {
		const many = Array.from({ length: MAX_HEADERS + 50 }, (_, i) => ({
			name: `h${i}`,
			value: "v",
		}));
		expect(Object.keys(normalizeHeaders(many)).length).toBe(MAX_HEADERS);
	});
});

describe("HeaderCache", () => {
	test("stores and returns a captured response per tab", () => {
		const cache = new HeaderCache();
		cache.set(4, { headers: { server: "nginx" }, ip: "1.2.3.4" });
		expect(cache.get(4)).toEqual({
			headers: { server: "nginx" },
			ip: "1.2.3.4",
		});
	});

	test("returns undefined for an unknown tab", () => {
		expect(new HeaderCache().get(99)).toBeUndefined();
	});

	test("forget drops a tab", () => {
		const cache = new HeaderCache();
		cache.set(1, { headers: {} });
		cache.forget(1);
		expect(cache.get(1)).toBeUndefined();
	});
});
