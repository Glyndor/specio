// Payment-processor fingerprints.

import type { Rule } from "../../fingerprint/schema/index.ts";

export const PAYMENT_RULES: Rule[] = [
	{
		id: "stripe",
		name: "Stripe",
		categories: ["payment-processor"],
		icon: "stripe",
		signals: [
			{
				source: "script-src",
				pattern: "js\\.stripe\\.com",
				strength: "strong",
			},
			{ source: "js-global", pattern: "^Stripe$", strength: "weak" },
		],
	},
	{
		id: "paypal",
		name: "PayPal",
		categories: ["payment-processor"],
		icon: "paypal",
		signals: [
			{
				source: "script-src",
				pattern: "(?:www\\.paypalobjects\\.com|js\\.paypal\\.com)",
				strength: "strong",
			},
		],
	},
];
