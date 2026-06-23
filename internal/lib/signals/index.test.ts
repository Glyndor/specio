import { describe, expect, test } from "bun:test";
import {
	clampSignal,
	MAX_SIGNAL_LENGTH,
	type PageSignals,
	valuesForSource,
} from "./index.ts";

const signals: PageSignals = {
	url: "https://example.com/page.php",
	html: "<html><body>/wp-content/</body></html>",
	scripts: ["https://cdn/jquery-3.6.0.min.js", "https://cdn/app.js"],
	metas: [
		{ name: "generator", content: "WordPress 6.4.2" },
		{ name: null, content: "ignored" },
	],
	headers: { server: "nginx/1.25.3", "x-powered-by": "PHP/8.2.0" },
	cookies: ["PHPSESSID", "wordpress_logged_in_abc"],
	jsGlobals: ["jQuery", "React"],
};

describe("clampSignal", () => {
	test("leaves short values untouched", () => {
		expect(clampSignal("short")).toBe("short");
	});

	test("truncates values past the cap", () => {
		const huge = "x".repeat(MAX_SIGNAL_LENGTH + 100);
		expect(clampSignal(huge).length).toBe(MAX_SIGNAL_LENGTH);
	});
});

describe("valuesForSource", () => {
	test("html yields the document markup", () => {
		expect(valuesForSource(signals, "html", undefined)).toEqual([
			signals.html,
		]);
	});

	test("url yields the document url", () => {
		expect(valuesForSource(signals, "url", undefined)).toEqual([
			signals.url,
		]);
	});

	test("script-src yields every script url", () => {
		expect(valuesForSource(signals, "script-src", undefined)).toEqual(
			signals.scripts,
		);
	});

	test("js-global yields every global name", () => {
		expect(valuesForSource(signals, "js-global", undefined)).toEqual([
			"jQuery",
			"React",
		]);
	});

	test("a keyed header is matched case-insensitively", () => {
		expect(valuesForSource(signals, "header", "Server")).toEqual([
			"nginx/1.25.3",
		]);
	});

	test("a missing header yields nothing", () => {
		expect(valuesForSource(signals, "header", "x-frame-options")).toEqual(
			[],
		);
	});

	test("an unkeyed header source yields every value", () => {
		expect(valuesForSource(signals, "header", undefined)).toEqual([
			"nginx/1.25.3",
			"PHP/8.2.0",
		]);
	});

	test("a keyed cookie filters by name", () => {
		expect(valuesForSource(signals, "cookie", "phpsessid")).toEqual([
			"PHPSESSID",
		]);
	});

	test("an unkeyed cookie source yields every cookie", () => {
		expect(valuesForSource(signals, "cookie", undefined)).toEqual(
			signals.cookies,
		);
	});

	test("a keyed meta yields its content", () => {
		expect(valuesForSource(signals, "meta", "generator")).toEqual([
			"WordPress 6.4.2",
		]);
	});

	test("an unkeyed meta source yields every content, empty for missing", () => {
		expect(valuesForSource(signals, "meta", undefined)).toEqual([
			"WordPress 6.4.2",
			"ignored",
		]);
	});
});
