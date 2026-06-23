// Web-server fingerprints, read from the Server header.

import type { Rule } from "../../fingerprint/schema/index.ts";

export const SERVER_RULES: Rule[] = [
	{
		id: "nginx",
		name: "Nginx",
		categories: ["web-server"],
		icon: "nginx",
		signals: [
			{
				source: "header",
				key: "server",
				pattern: "nginx(?:/([\\d.]+))?",
				strength: "strong",
				version: 1,
			},
		],
	},
	{
		id: "apache",
		name: "Apache",
		categories: ["web-server"],
		icon: "apache",
		signals: [
			{
				source: "header",
				key: "server",
				pattern: "Apache(?:/([\\d.]+))?",
				strength: "strong",
				version: 1,
			},
		],
	},
	{
		id: "iis",
		name: "Microsoft IIS",
		categories: ["web-server"],
		icon: "internetexplorer",
		signals: [
			{
				source: "header",
				key: "server",
				pattern: "Microsoft-IIS(?:/([\\d.]+))?",
				strength: "strong",
				version: 1,
			},
		],
	},
];
