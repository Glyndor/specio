// JavaScript library, UI framework, and font/icon fingerprints.

import type { Rule } from "../../fingerprint/schema/index.ts";

export const LIBRARY_RULES: Rule[] = [
	{
		id: "jquery",
		name: "jQuery",
		categories: ["javascript-library"],
		icon: "jquery",
		signals: [
			{ source: "js-global", pattern: "^jQuery$", strength: "strong" },
			{
				source: "script-src",
				pattern: "jquery[.-]([\\d.]+)(?:\\.min)?\\.js",
				strength: "strong",
				version: 1,
			},
			{
				source: "script-src",
				pattern: "jquery(?:\\.min)?\\.js",
				strength: "weak",
			},
		],
	},
	{
		id: "bootstrap",
		name: "Bootstrap",
		categories: ["ui-framework"],
		icon: "bootstrap",
		signals: [
			{
				source: "script-src",
				pattern: "bootstrap(?:\\.bundle)?(?:\\.min)?\\.js",
				strength: "strong",
			},
			{
				source: "html",
				pattern: "bootstrap(?:\\.min)?\\.css",
				strength: "weak",
			},
		],
	},
	{
		id: "google-fonts",
		name: "Google Fonts",
		categories: ["font-script"],
		icon: "googlefonts",
		signals: [
			{
				source: "html",
				pattern: "fonts\\.googleapis\\.com",
				strength: "strong",
			},
		],
	},
	{
		id: "font-awesome",
		name: "Font Awesome",
		categories: ["font-script"],
		icon: "fontawesome",
		signals: [
			{
				source: "html",
				pattern: "font-?awesome(?:[./-]|\\.css)",
				strength: "strong",
			},
		],
	},
];
