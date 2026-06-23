// JavaScript and full-stack framework fingerprints.

import type { Rule } from "../../fingerprint/schema/index.ts";

export const FRAMEWORK_RULES: Rule[] = [
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
		id: "angular",
		name: "Angular",
		categories: ["javascript-framework"],
		icon: "angular",
		signals: [
			{
				source: "html",
				pattern: 'ng-version="([\\d.]+)"',
				strength: "strong",
				version: 1,
			},
			{ source: "html", pattern: "_nghost-", strength: "strong" },
			{ source: "html", pattern: "_ngcontent-", strength: "weak" },
		],
	},
	{
		id: "svelte",
		name: "Svelte",
		categories: ["javascript-framework"],
		icon: "svelte",
		signals: [
			{
				source: "html",
				pattern: 'class="[^"]*svelte-[0-9a-z]+',
				strength: "strong",
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
		id: "nuxt",
		name: "Nuxt",
		categories: ["web-framework"],
		icon: "nuxtdotjs",
		implies: ["vue"],
		signals: [
			{ source: "html", pattern: 'id="__nuxt"', strength: "strong" },
			{ source: "js-global", pattern: "^__NUXT__$", strength: "strong" },
			{ source: "script-src", pattern: "/_nuxt/", strength: "weak" },
		],
	},
	{
		id: "gatsby",
		name: "Gatsby",
		categories: ["web-framework"],
		icon: "gatsby",
		implies: ["react"],
		signals: [
			{ source: "html", pattern: 'id="___gatsby"', strength: "strong" },
			{ source: "script-src", pattern: "/page-data/", strength: "weak" },
		],
	},
];
