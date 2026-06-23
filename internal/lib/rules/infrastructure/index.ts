// CDN and hosting fingerprints, read mostly from response headers.

import type { Rule } from "../../fingerprint/schema/index.ts";

export const INFRASTRUCTURE_RULES: Rule[] = [
	{
		id: "cloudflare",
		name: "Cloudflare",
		categories: ["cdn"],
		icon: "cloudflare",
		signals: [
			{
				source: "header",
				key: "server",
				pattern: "^cloudflare$",
				strength: "strong",
			},
			{
				source: "header",
				key: "cf-ray",
				pattern: ".+",
				strength: "strong",
			},
		],
	},
	{
		id: "vercel",
		name: "Vercel",
		categories: ["hosting"],
		icon: "vercel",
		signals: [
			{
				source: "header",
				key: "x-vercel-id",
				pattern: ".+",
				strength: "strong",
			},
			{
				source: "header",
				key: "server",
				pattern: "^Vercel$",
				strength: "strong",
			},
		],
	},
	{
		id: "netlify",
		name: "Netlify",
		categories: ["hosting"],
		icon: "netlify",
		signals: [
			{
				source: "header",
				key: "x-nf-request-id",
				pattern: ".+",
				strength: "strong",
			},
			{
				source: "header",
				key: "server",
				pattern: "^Netlify$",
				strength: "strong",
			},
		],
	},
	{
		id: "fastly",
		name: "Fastly",
		categories: ["cdn"],
		icon: "fastly",
		signals: [
			{
				source: "header",
				key: "x-served-by",
				pattern: "cache-[a-z]+\\d+",
				strength: "weak",
			},
			{
				source: "header",
				key: "x-fastly-request-id",
				pattern: ".+",
				strength: "strong",
			},
		],
	},
];
