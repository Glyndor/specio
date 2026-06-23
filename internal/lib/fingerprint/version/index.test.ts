import { describe, expect, test } from "bun:test";
import { extractVersion, resolveVersion } from "./index.ts";

describe("resolveVersion", () => {
	test("returns the version when one source speaks", () => {
		expect(resolveVersion(["6.4.2"])).toBe("6.4.2");
	});

	test("returns the version when every source agrees", () => {
		expect(resolveVersion(["6.4.2", "6.4.2", " 6.4.2 "])).toBe("6.4.2");
	});

	test("reports no version when sources disagree rather than guessing", () => {
		expect(resolveVersion(["6.4.2", "5.9.0"])).toBeUndefined();
	});

	test("ignores empty and whitespace-only candidates", () => {
		expect(resolveVersion(["", "  ", "17.0.2"])).toBe("17.0.2");
	});

	test("returns undefined when nothing carried a version", () => {
		expect(resolveVersion([])).toBeUndefined();
	});
});

describe("extractVersion", () => {
	const match = "react@18.2.0".match(/react@([\d.]+)/) as RegExpMatchArray;

	test("extracts the declared capture group", () => {
		expect(extractVersion(match, 1)).toBe("18.2.0");
	});

	test("returns undefined when the rule declares no version group", () => {
		expect(extractVersion(match, undefined)).toBeUndefined();
	});

	test("returns undefined for an out-of-range group", () => {
		expect(extractVersion(match, 5)).toBeUndefined();
	});

	test("returns undefined for a zero or negative group", () => {
		expect(extractVersion(match, 0)).toBeUndefined();
	});

	test("returns undefined when the capture matched nothing", () => {
		const optional = "WordPress".match(
			/WordPress(?:\s+([\d.]+))?/,
		) as RegExpMatchArray;
		expect(extractVersion(optional, 1)).toBeUndefined();
	});
});
