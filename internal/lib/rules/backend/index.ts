// Backend language and web-framework fingerprints.

import type { Rule } from "../../fingerprint/schema/index.ts";

export const BACKEND_RULES: Rule[] = [
	{
		id: "php",
		name: "PHP",
		categories: ["programming-language"],
		icon: "php",
		signals: [
			{
				source: "header",
				key: "x-powered-by",
				pattern: "PHP(?:/([\\d.]+))?",
				strength: "strong",
				version: 1,
			},
			{ source: "cookie", pattern: "^PHPSESSID$", strength: "strong" },
		],
	},
	{
		id: "laravel",
		name: "Laravel",
		categories: ["web-framework"],
		icon: "laravel",
		implies: ["php"],
		signals: [
			{
				source: "cookie",
				pattern: "^laravel_session$",
				strength: "strong",
			},
			{ source: "cookie", pattern: "^XSRF-TOKEN$", strength: "weak" },
		],
	},
	{
		id: "rails",
		name: "Ruby on Rails",
		categories: ["web-framework"],
		icon: "rubyonrails",
		signals: [
			{
				source: "meta",
				key: "csrf-param",
				pattern: "authenticity_token",
				strength: "strong",
			},
			{
				source: "header",
				key: "x-runtime",
				pattern: "^[\\d.]+$",
				strength: "weak",
			},
		],
	},
	{
		id: "aspnet",
		name: "ASP.NET",
		categories: ["web-framework"],
		icon: "dotnet",
		signals: [
			{
				source: "header",
				key: "x-aspnet-version",
				pattern: "([\\d.]+)",
				strength: "strong",
				version: 1,
			},
			{
				source: "header",
				key: "x-powered-by",
				pattern: "ASP\\.NET",
				strength: "strong",
			},
			{
				source: "cookie",
				pattern: "^ASP\\.NET_SessionId$",
				strength: "strong",
			},
		],
	},
];
