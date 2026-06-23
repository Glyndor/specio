// Golden corpus: one fixture per rule, a snapshot of the page signals a real
// site of that technology exposes. Each proves its rule matches (recall) and,
// because every fixture is minimal, that it does not trip other rules
// (precision). The benchmark under tests/benchmark replays them deterministically.

import type { Confidence } from "../../internal/lib/fingerprint/confidence/index.ts";
import type { PageSignals } from "../../internal/lib/signals/index.ts";

/** A page snapshot plus what specio is expected to conclude from it. */
export interface Fixture {
	/** The rule id this fixture exercises. */
	expectedId: string;
	/** The confidence level the fixture should reach. */
	expectedConfidence: Confidence;
	/** The version the fixture should resolve, when it carries one. */
	expectedVersion?: string;
	/** The page signals. */
	signals: PageSignals;
}

function page(overrides: Partial<PageSignals>): PageSignals {
	return {
		url: "https://example.com/",
		html: "",
		scripts: [],
		metas: [],
		headers: {},
		cookies: [],
		jsGlobals: [],
		...overrides,
	};
}

export const FIXTURES: Fixture[] = [
	{
		expectedId: "wordpress",
		expectedConfidence: "confirmed",
		expectedVersion: "6.4.2",
		signals: page({
			html: "<link href='/wp-content/themes/x/style.css'><script src='/wp-includes/js/a.js'></script>",
			metas: [{ name: "generator", content: "WordPress 6.4.2" }],
		}),
	},
	{
		expectedId: "woocommerce",
		expectedConfidence: "confirmed",
		signals: page({
			html: "<body class='woocommerce-page woocommerce'>",
			cookies: ["woocommerce_items_in_cart"],
		}),
	},
	{
		expectedId: "drupal",
		expectedConfidence: "confirmed",
		expectedVersion: "10",
		signals: page({
			metas: [
				{
					name: "generator",
					content: "Drupal 10 (https://www.drupal.org)",
				},
			],
			headers: { "x-generator": "Drupal 10 (https://www.drupal.org)" },
		}),
	},
	{
		expectedId: "joomla",
		expectedConfidence: "likely",
		expectedVersion: "4.2.1",
		signals: page({
			html: "<script src='/media/jui/js/jquery.min.js'></script>",
			metas: [
				{
					name: "generator",
					content: "Joomla! 4.2.1 - Open Source Content Management",
				},
			],
		}),
	},
	{
		expectedId: "react",
		expectedConfidence: "confirmed",
		signals: page({
			html: "<div id='root' data-reactroot></div>",
			jsGlobals: ["__REACT_DEVTOOLS_GLOBAL_HOOK__"],
		}),
	},
	{
		expectedId: "vue",
		expectedConfidence: "confirmed",
		signals: page({
			html: "<div data-v-1a2b3c4d></div>",
			jsGlobals: ["__VUE__"],
		}),
	},
	{
		expectedId: "nextjs",
		expectedConfidence: "confirmed",
		signals: page({
			html: '<div id="__next"></div>',
			scripts: ["https://example.com/_next/static/chunks/main.js"],
		}),
	},
	{
		expectedId: "jquery",
		expectedConfidence: "confirmed",
		expectedVersion: "3.6.0",
		signals: page({
			scripts: ["https://code.jquery.com/jquery-3.6.0.min.js"],
			jsGlobals: ["jQuery"],
		}),
	},
	{
		expectedId: "bootstrap",
		expectedConfidence: "likely",
		signals: page({
			html: "<link href='/css/bootstrap.min.css' rel='stylesheet'>",
			scripts: ["https://cdn.example.com/bootstrap.bundle.min.js"],
		}),
	},
	{
		expectedId: "nginx",
		expectedConfidence: "likely",
		expectedVersion: "1.25.3",
		signals: page({ headers: { server: "nginx/1.25.3" } }),
	},
	{
		expectedId: "apache",
		expectedConfidence: "likely",
		expectedVersion: "2.4.57",
		signals: page({ headers: { server: "Apache/2.4.57 (Ubuntu)" } }),
	},
	{
		expectedId: "cloudflare",
		expectedConfidence: "confirmed",
		signals: page({
			headers: { server: "cloudflare", "cf-ray": "8a1b2c3d4e5f-MAD" },
		}),
	},
	{
		expectedId: "google-analytics",
		expectedConfidence: "likely",
		signals: page({
			scripts: ["https://www.googletagmanager.com/gtag/js?id=G-XXXX"],
		}),
	},
	{
		expectedId: "google-tag-manager",
		expectedConfidence: "likely",
		signals: page({
			scripts: ["https://www.googletagmanager.com/gtm.js?id=GTM-XXXX"],
		}),
	},
	{
		expectedId: "shopify",
		expectedConfidence: "confirmed",
		signals: page({
			headers: { "x-shopid": "12345678" },
			scripts: ["https://cdn.shopify.com/s/files/1/app.js"],
		}),
	},
	{
		expectedId: "php",
		expectedConfidence: "confirmed",
		expectedVersion: "8.2.0",
		signals: page({
			headers: { "x-powered-by": "PHP/8.2.0" },
			cookies: ["PHPSESSID"],
		}),
	},
	{
		expectedId: "ghost",
		expectedConfidence: "likely",
		expectedVersion: "5.0",
		signals: page({
			html: "<a href='/ghost/'>admin</a>",
			metas: [{ name: "generator", content: "Ghost 5.0" }],
		}),
	},
	{
		expectedId: "wix",
		expectedConfidence: "confirmed",
		signals: page({
			html: "<img src='https://static.wixstatic.com/media/x.jpg'>",
			metas: [{ name: "generator", content: "Wix.com Website Builder" }],
		}),
	},
	{
		expectedId: "squarespace",
		expectedConfidence: "confirmed",
		signals: page({
			html: "<script src='https://static1.squarespace.com/x.js'></script>",
			jsGlobals: ["SQUARESPACE_CONTEXT"],
		}),
	},
	{
		expectedId: "webflow",
		expectedConfidence: "confirmed",
		signals: page({
			html: "<html data-wf-page='abc' data-wf-site='def'>",
			metas: [{ name: "generator", content: "Webflow" }],
		}),
	},
	{
		expectedId: "magento",
		expectedConfidence: "confirmed",
		signals: page({
			headers: { "x-magento-vary": "abc123" },
			cookies: ["X-Magento-Vary"],
		}),
	},
	{
		expectedId: "angular",
		expectedConfidence: "confirmed",
		expectedVersion: "17.0.1",
		signals: page({
			html: '<app-root ng-version="17.0.1" _nghost-abc></app-root>',
		}),
	},
	{
		expectedId: "svelte",
		expectedConfidence: "likely",
		signals: page({
			html: '<div class="container svelte-1a2b3c">hi</div>',
		}),
	},
	{
		expectedId: "nuxt",
		expectedConfidence: "confirmed",
		signals: page({
			html: '<div id="__nuxt"></div>',
			jsGlobals: ["__NUXT__"],
		}),
	},
	{
		expectedId: "gatsby",
		expectedConfidence: "likely",
		signals: page({
			html: '<div id="___gatsby"></div>',
			scripts: ["https://example.com/page-data/index/page-data.json"],
		}),
	},
	{
		expectedId: "laravel",
		expectedConfidence: "likely",
		signals: page({ cookies: ["laravel_session", "XSRF-TOKEN"] }),
	},
	{
		expectedId: "rails",
		expectedConfidence: "likely",
		signals: page({
			metas: [{ name: "csrf-param", content: "authenticity_token" }],
			headers: { "x-runtime": "0.123456" },
		}),
	},
	{
		expectedId: "aspnet",
		expectedConfidence: "confirmed",
		expectedVersion: "4.0.30319",
		signals: page({
			headers: { "x-aspnet-version": "4.0.30319" },
			cookies: ["ASP.NET_SessionId"],
		}),
	},
	{
		expectedId: "iis",
		expectedConfidence: "likely",
		expectedVersion: "10.0",
		signals: page({ headers: { server: "Microsoft-IIS/10.0" } }),
	},
	{
		expectedId: "vercel",
		expectedConfidence: "confirmed",
		signals: page({
			headers: { "x-vercel-id": "iad1::abc", server: "Vercel" },
		}),
	},
	{
		expectedId: "netlify",
		expectedConfidence: "confirmed",
		signals: page({
			headers: { "x-nf-request-id": "abc-123", server: "Netlify" },
		}),
	},
	{
		expectedId: "fastly",
		expectedConfidence: "likely",
		signals: page({
			headers: {
				"x-served-by": "cache-mad12345-MAD",
				"x-fastly-request-id": "abc123",
			},
		}),
	},
	{
		expectedId: "google-fonts",
		expectedConfidence: "likely",
		signals: page({
			html: "<link href='https://fonts.googleapis.com/css?family=Roboto'>",
		}),
	},
	{
		expectedId: "font-awesome",
		expectedConfidence: "likely",
		signals: page({
			html: "<link href='/css/font-awesome.min.css' rel='stylesheet'>",
		}),
	},
	{
		expectedId: "hotjar",
		expectedConfidence: "likely",
		signals: page({
			scripts: ["https://static.hotjar.com/c/hotjar-123.js"],
			jsGlobals: ["hj"],
		}),
	},
	{
		expectedId: "matomo",
		expectedConfidence: "likely",
		signals: page({
			scripts: ["https://cdn.example.com/matomo.js"],
			jsGlobals: ["Matomo"],
		}),
	},
	{
		expectedId: "hubspot",
		expectedConfidence: "likely",
		signals: page({
			scripts: ["https://js.hs-scripts.com/123456.js"],
		}),
	},
	{
		expectedId: "stripe",
		expectedConfidence: "likely",
		signals: page({
			scripts: ["https://js.stripe.com/v3/"],
			jsGlobals: ["Stripe"],
		}),
	},
	{
		expectedId: "paypal",
		expectedConfidence: "likely",
		signals: page({
			scripts: ["https://www.paypalobjects.com/api/checkout.js"],
		}),
	},
];
