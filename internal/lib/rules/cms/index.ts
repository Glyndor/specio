// CMS fingerprints. Clean-room: every signal is a public fact about how the
// platform presents itself on a page. Each ships with a fixture under tests/.

import type { Rule } from "../../fingerprint/schema/index.ts";

export const CMS_RULES: Rule[] = [
	{
		id: "wordpress",
		name: "WordPress",
		categories: ["cms"],
		icon: "wordpress",
		website: "https://wordpress.org",
		implies: ["php"],
		signals: [
			{
				source: "meta",
				key: "generator",
				pattern: "WordPress(?:\\s+([\\d.]+))?",
				strength: "strong",
				version: 1,
			},
			{ source: "html", pattern: "/wp-content/", strength: "weak" },
			{ source: "html", pattern: "/wp-includes/", strength: "weak" },
			{
				source: "header",
				key: "x-pingback",
				pattern: "xmlrpc\\.php",
				strength: "strong",
			},
			{ source: "cookie", pattern: "^wordpress_", strength: "strong" },
		],
	},
	{
		id: "drupal",
		name: "Drupal",
		categories: ["cms"],
		icon: "drupal",
		implies: ["php"],
		signals: [
			{
				source: "meta",
				key: "generator",
				pattern: "Drupal(?:\\s+([\\d.]+))?",
				strength: "strong",
				version: 1,
			},
			{
				source: "header",
				key: "x-generator",
				pattern: "Drupal(?:\\s+([\\d.]+))?",
				strength: "strong",
				version: 1,
			},
			{
				source: "html",
				pattern: "/sites/(?:all|default)/",
				strength: "weak",
			},
		],
	},
	{
		id: "joomla",
		name: "Joomla",
		categories: ["cms"],
		icon: "joomla",
		implies: ["php"],
		signals: [
			{
				source: "meta",
				key: "generator",
				pattern: "Joomla(?:!\\s*([\\d.]+))?",
				strength: "strong",
				version: 1,
			},
			{ source: "html", pattern: "/media/jui/", strength: "weak" },
		],
	},
	{
		id: "ghost",
		name: "Ghost",
		categories: ["cms"],
		icon: "ghost",
		signals: [
			{
				source: "meta",
				key: "generator",
				pattern: "Ghost(?:\\s+([\\d.]+))?",
				strength: "strong",
				version: 1,
			},
			{ source: "html", pattern: "/ghost/", strength: "weak" },
		],
	},
	{
		id: "wix",
		name: "Wix",
		categories: ["cms"],
		icon: "wix",
		signals: [
			{
				source: "meta",
				key: "generator",
				pattern: "Wix\\.com",
				strength: "strong",
			},
			{
				source: "html",
				pattern: "static\\.wixstatic\\.com",
				strength: "strong",
			},
			{
				source: "header",
				key: "x-wix-request-id",
				pattern: ".+",
				strength: "strong",
			},
		],
	},
	{
		id: "squarespace",
		name: "Squarespace",
		categories: ["cms"],
		icon: "squarespace",
		signals: [
			{
				source: "html",
				pattern: "static1\\.squarespace\\.com",
				strength: "strong",
			},
			{
				source: "js-global",
				pattern: "^SQUARESPACE_CONTEXT$",
				strength: "strong",
			},
		],
	},
	{
		id: "webflow",
		name: "Webflow",
		categories: ["cms"],
		icon: "webflow",
		signals: [
			{
				source: "meta",
				key: "generator",
				pattern: "Webflow",
				strength: "strong",
			},
			{
				source: "html",
				pattern: "data-wf-(?:page|site)",
				strength: "strong",
			},
		],
	},
];
