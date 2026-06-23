import { describe, expect, test } from "bun:test";
import type { PageSignals } from "../../signals/index.ts";
import type { Rule } from "../schema/index.ts";
import { detect } from "./index.ts";

function emptySignals(overrides: Partial<PageSignals> = {}): PageSignals {
	return {
		url: "https://example.com/",
		html: "",
		scripts: [],
		metas: [],
		headers: {},
		cookies: [],
		jsGlobals: [],
		...overrides,
	};
}

describe("detect", () => {
	test("accumulates confidence and extracts a version", () => {
		const rules: Rule[] = [
			{
				id: "wp",
				name: "WordPress",
				categories: ["cms"],
				signals: [
					{
						source: "meta",
						key: "generator",
						pattern: "WordPress(?:\\s+([\\d.]+))?",
						strength: "strong",
						version: 1,
					},
					{
						source: "html",
						pattern: "/wp-content/",
						strength: "weak",
					},
					{
						source: "html",
						pattern: "/wp-includes/",
						strength: "weak",
					},
				],
			},
		];
		const [d] = detect(
			emptySignals({
				html: "<a href='/wp-content/'></a><b>/wp-includes/</b>",
				metas: [{ name: "generator", content: "WordPress 6.4.2" }],
			}),
			rules,
		);
		expect(d.confidence).toBe("confirmed");
		expect(d.version).toBe("6.4.2");
		expect(d.evidence).toHaveLength(3);
	});

	test("drops a detection whose required technology is absent", () => {
		const rules: Rule[] = [
			{
				id: "child",
				name: "Child",
				categories: ["cms"],
				requires: ["parent"],
				signals: [
					{ source: "html", pattern: "child", strength: "strong" },
				],
			},
		];
		expect(detect(emptySignals({ html: "child" }), rules)).toHaveLength(0);
	});

	test("keeps a detection when its requirement is also present", () => {
		const rules: Rule[] = [
			{
				id: "parent",
				name: "Parent",
				categories: ["cms"],
				signals: [
					{ source: "html", pattern: "parent", strength: "strong" },
				],
			},
			{
				id: "child",
				name: "Child",
				categories: ["cms"],
				requires: ["parent"],
				signals: [
					{ source: "html", pattern: "child", strength: "strong" },
				],
			},
		];
		const ids = detect(emptySignals({ html: "parent child" }), rules).map(
			(d) => d.id,
		);
		expect(ids).toContain("parent");
		expect(ids).toContain("child");
	});

	test("excludes drops the lower-scoring of two mutually-exclusive matches", () => {
		const rules: Rule[] = [
			{
				id: "strongtech",
				name: "Strong",
				categories: ["cms"],
				excludes: ["weaktech"],
				signals: [
					{ source: "html", pattern: "aaa", strength: "strong" },
					{ source: "html", pattern: "bbb", strength: "strong" },
				],
			},
			{
				id: "weaktech",
				name: "Weak",
				categories: ["cms"],
				signals: [
					{ source: "html", pattern: "ccc", strength: "strong" },
				],
			},
		];
		const ids = detect(emptySignals({ html: "aaa bbb ccc" }), rules).map(
			(d) => d.id,
		);
		expect(ids).toEqual(["strongtech"]);
	});

	test("infers implied technologies as likely without evidence", () => {
		const rules: Rule[] = [
			{
				id: "wp",
				name: "WordPress",
				categories: ["cms"],
				implies: ["php"],
				signals: [
					{ source: "html", pattern: "wp", strength: "strong" },
				],
			},
			{
				id: "php",
				name: "PHP",
				categories: ["programming-language"],
				signals: [
					{
						source: "header",
						key: "x",
						pattern: "never",
						strength: "strong",
					},
				],
			},
		];
		const php = detect(emptySignals({ html: "wp" }), rules).find(
			(d) => d.id === "php",
		);
		expect(php?.implied).toBe(true);
		expect(php?.confidence).toBe("likely");
		expect(php?.evidence).toHaveLength(0);
	});

	test("a directly detected technology keeps its match over an implication", () => {
		const rules: Rule[] = [
			{
				id: "wp",
				name: "WordPress",
				categories: ["cms"],
				implies: ["php"],
				signals: [
					{ source: "html", pattern: "wp", strength: "strong" },
				],
			},
			{
				id: "php",
				name: "PHP",
				categories: ["programming-language"],
				signals: [
					{
						source: "header",
						key: "x-powered-by",
						pattern: "PHP",
						strength: "strong",
					},
				],
			},
		];
		const php = detect(
			emptySignals({
				html: "wp",
				headers: { "x-powered-by": "PHP/8.2" },
			}),
			rules,
		).find((d) => d.id === "php");
		expect(php?.implied).toBe(false);
	});

	test("an implies target that is not a known rule is ignored", () => {
		const rules: Rule[] = [
			{
				id: "wp",
				name: "WordPress",
				categories: ["cms"],
				implies: ["ghost-tech"],
				signals: [
					{ source: "html", pattern: "wp", strength: "strong" },
				],
			},
		];
		expect(detect(emptySignals({ html: "wp" }), rules)).toHaveLength(1);
	});

	test("a malformed pattern is skipped, not crashing the match", () => {
		const rules: Rule[] = [
			{
				id: "broken",
				name: "Broken",
				categories: ["cms"],
				signals: [
					{
						source: "html",
						pattern: "(unclosed",
						strength: "strong",
					},
					{ source: "html", pattern: "ok", strength: "strong" },
				],
			},
		];
		const [d] = detect(emptySignals({ html: "ok" }), rules);
		expect(d.id).toBe("broken");
		expect(d.evidence).toHaveLength(1);
	});

	test("truncates long evidence values", () => {
		const rules: Rule[] = [
			{
				id: "t",
				name: "T",
				categories: ["cms"],
				signals: [{ source: "html", pattern: "x", strength: "strong" }],
			},
		];
		const [d] = detect(emptySignals({ html: "x".repeat(500) }), rules);
		expect(d.evidence[0].value.endsWith("…")).toBe(true);
		expect(d.evidence[0].value.length).toBe(201);
	});

	test("a blank page detects nothing (no false positives)", () => {
		const rules: Rule[] = [
			{
				id: "t",
				name: "T",
				categories: ["cms"],
				signals: [
					{ source: "html", pattern: "needle", strength: "strong" },
				],
			},
		];
		expect(detect(emptySignals(), rules)).toHaveLength(0);
	});
});
