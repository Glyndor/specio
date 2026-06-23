// Analytics and tag-manager fingerprints.

import type { Rule } from "../../fingerprint/schema/index.ts";

export const ANALYTICS_RULES: Rule[] = [
	{
		id: "google-analytics",
		name: "Google Analytics",
		categories: ["analytics"],
		icon: "googleanalytics",
		signals: [
			{
				source: "script-src",
				pattern: "google-analytics\\.com/(?:analytics|ga)\\.js",
				strength: "strong",
			},
			{
				source: "script-src",
				pattern: "googletagmanager\\.com/gtag/js",
				strength: "strong",
			},
		],
	},
	{
		id: "google-tag-manager",
		name: "Google Tag Manager",
		categories: ["tag-manager"],
		icon: "googletagmanager",
		signals: [
			{
				source: "script-src",
				pattern: "googletagmanager\\.com/gtm\\.js",
				strength: "strong",
			},
			{
				source: "html",
				pattern: "googletagmanager\\.com/ns\\.html",
				strength: "strong",
			},
		],
	},
	{
		id: "hotjar",
		name: "Hotjar",
		categories: ["analytics"],
		icon: "hotjar",
		signals: [
			{
				source: "script-src",
				pattern: "static\\.hotjar\\.com",
				strength: "strong",
			},
			{ source: "js-global", pattern: "^hj$", strength: "weak" },
		],
	},
	{
		id: "matomo",
		name: "Matomo",
		categories: ["analytics"],
		icon: "matomo",
		signals: [
			{
				source: "script-src",
				pattern: "(?:matomo|piwik)\\.js",
				strength: "strong",
			},
			{ source: "js-global", pattern: "^Matomo$", strength: "weak" },
		],
	},
	{
		id: "hubspot",
		name: "HubSpot",
		categories: ["analytics"],
		icon: "hubspot",
		signals: [
			{
				source: "script-src",
				pattern: "(?:js\\.hs-scripts\\.com|js\\.hsforms\\.net)",
				strength: "strong",
			},
		],
	},
];
