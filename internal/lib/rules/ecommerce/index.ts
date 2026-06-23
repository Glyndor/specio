// Ecommerce platform fingerprints.

import type { Rule } from "../../fingerprint/schema/index.ts";

export const ECOMMERCE_RULES: Rule[] = [
	{
		id: "woocommerce",
		name: "WooCommerce",
		categories: ["ecommerce"],
		icon: "woocommerce",
		implies: ["wordpress"],
		signals: [
			{
				source: "html",
				pattern: "woocommerce(?:-|/)",
				strength: "strong",
			},
			{ source: "cookie", pattern: "^woocommerce_", strength: "strong" },
			{
				source: "meta",
				key: "generator",
				pattern: "WooCommerce(?:\\s+([\\d.]+))?",
				strength: "strong",
				version: 1,
			},
		],
	},
	{
		id: "shopify",
		name: "Shopify",
		categories: ["ecommerce"],
		icon: "shopify",
		signals: [
			{
				source: "header",
				key: "x-shopid",
				pattern: ".+",
				strength: "strong",
			},
			{
				source: "script-src",
				pattern: "cdn\\.shopify\\.com",
				strength: "strong",
			},
			{ source: "cookie", pattern: "^_shopify_", strength: "weak" },
		],
	},
	{
		id: "magento",
		name: "Magento",
		categories: ["ecommerce"],
		icon: "magento",
		implies: ["php"],
		signals: [
			{
				source: "header",
				key: "x-magento-vary",
				pattern: ".+",
				strength: "strong",
			},
			{ source: "cookie", pattern: "^X-Magento-", strength: "strong" },
			{
				source: "html",
				pattern: "/static/version\\d+/",
				strength: "weak",
			},
		],
	},
];
