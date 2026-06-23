// The bundled specio ruleset, aggregated from per-category files. Every rule is
// authored clean-room from public knowledge — the signals are facts about how a
// technology presents itself on a page, never imported from Wappalyzer or any
// fork. Each technology is recognised through several independent signals so
// detection survives one being hidden, and each ships a fixture under tests/
// proving it matches without false-positiving. Coverage grows release over
// release; add a category file or extend one, never a flat dump here.

import type { Rule } from "../fingerprint/schema/index.ts";
import { ANALYTICS_RULES } from "./analytics/index.ts";
import { BACKEND_RULES } from "./backend/index.ts";
import { CMS_RULES } from "./cms/index.ts";
import { ECOMMERCE_RULES } from "./ecommerce/index.ts";
import { FRAMEWORK_RULES } from "./frameworks/index.ts";
import { INFRASTRUCTURE_RULES } from "./infrastructure/index.ts";
import { LIBRARY_RULES } from "./libraries/index.ts";
import { PAYMENT_RULES } from "./payments/index.ts";
import { SERVER_RULES } from "./servers/index.ts";

/** The technologies specio can currently detect. */
export const RULES: Rule[] = [
	...CMS_RULES,
	...ECOMMERCE_RULES,
	...FRAMEWORK_RULES,
	...BACKEND_RULES,
	...SERVER_RULES,
	...INFRASTRUCTURE_RULES,
	...LIBRARY_RULES,
	...ANALYTICS_RULES,
	...PAYMENT_RULES,
];
