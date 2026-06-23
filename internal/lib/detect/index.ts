// The detection facade the rest of the extension calls. It binds the matcher to
// the bundled ruleset so callers (the service worker, tests) pass page signals
// and get back the detected stack — fully local, no network.

import { type Detection, detect } from "../fingerprint/match/index.ts";
import { RULES } from "../rules/index.ts";
import type { PageSignals } from "../signals/index.ts";

export type { Detection } from "../fingerprint/match/index.ts";

/**
 * Detect the technologies present in `signals` using the bundled ruleset.
 * A thin wrapper over {@link detect} that supplies {@link RULES}.
 */
export function detectTechnologies(signals: PageSignals): Detection[] {
	return detect(signals, RULES);
}
