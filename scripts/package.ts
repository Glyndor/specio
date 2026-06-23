// Assembles the loadable extension into dist/ after the entrypoints are
// bundled: the manifest, the locale resources, and the popup's static files
// join the bundled JS so dist/ is a complete unpacked extension ready to load
// or zip. Run via `bun run package` (which builds first).

import { cp, mkdir } from "node:fs/promises";

const DIST = "dist";

await mkdir(`${DIST}/popup`, { recursive: true });

await Promise.all([
	cp("manifest.json", `${DIST}/manifest.json`),
	cp("_locales", `${DIST}/_locales`, { recursive: true }),
	cp("internal/popup/index.html", `${DIST}/popup/index.html`),
	cp("internal/popup/style.css", `${DIST}/popup/style.css`),
]);

console.log("Packaged extension into dist/");
