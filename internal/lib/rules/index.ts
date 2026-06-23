// The bundled specio ruleset. Authored clean-room from public knowledge — the
// signals are facts about how each technology presents itself on a page, never
// imported from Wappalyzer or any fork. Every rule recognises its technology
// through several independent signals so detection survives one being hidden,
// and each ships with a fixture under tests/ proving it matches without
// false-positiving. This is the seed set; coverage grows release over release.

import type { Rule } from "../fingerprint/schema/index.ts";

/** The technologies specio can currently detect. */
export const RULES: Rule[] = [
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
		id: "react",
		name: "React",
		categories: ["javascript-framework"],
		icon: "react",
		signals: [
			{ source: "html", pattern: "data-reactroot", strength: "strong" },
			{
				source: "js-global",
				pattern: "^__REACT_DEVTOOLS_GLOBAL_HOOK__$",
				strength: "strong",
			},
			{
				source: "script-src",
				pattern:
					"react(?:\\.production|\\.development)?(?:\\.min)?\\.js",
				strength: "weak",
			},
			{
				source: "script-src",
				pattern: "react@([\\d.]+)",
				strength: "strong",
				version: 1,
			},
		],
	},
	{
		id: "vue",
		name: "Vue.js",
		categories: ["javascript-framework"],
		icon: "vuedotjs",
		signals: [
			{ source: "js-global", pattern: "^__VUE__$", strength: "strong" },
			{
				source: "html",
				pattern: "data-v-[0-9a-f]{8}",
				strength: "strong",
			},
			{
				source: "script-src",
				pattern: "vue@([\\d.]+)",
				strength: "strong",
				version: 1,
			},
		],
	},
	{
		id: "nextjs",
		name: "Next.js",
		categories: ["web-framework"],
		icon: "nextdotjs",
		implies: ["react"],
		signals: [
			{ source: "html", pattern: 'id="__next"', strength: "strong" },
			{
				source: "script-src",
				pattern: "/_next/static/",
				strength: "strong",
			},
			{
				source: "meta",
				key: "next-head-count",
				pattern: ".*",
				strength: "weak",
			},
		],
	},
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
];
