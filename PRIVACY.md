# Privacy Policy

_Last updated: 2026-06-22_

specio is built to detect a website's technology stack **without learning
anything about you**. This policy explains exactly what it does and does not do.

## What specio collects

**Nothing.** specio has no account, no analytics, no telemetry, and no server.
It never sends the pages you visit, the technologies it detects, your IP, or any
other data to Glyndor or to any third party.

## How detection works

In its default (basic) mode, specio works entirely on your device. To identify a
technology it reads signals that are **already present** in the page your browser
loaded — the markup, script URLs, meta tags, cookie names — and the response
your browser already received. It matches those against a fingerprint database
that ships **inside the extension**. It makes **no network request of its own**.

To do this it needs permission to read the pages you visit (the standard "read
your data on the sites you visit" prompt). That permission is used only for
local detection; nothing read from a page leaves your machine.

## The advanced (DNS) tier — off by default

specio has an optional advanced tier that surfaces facts which only exist in a
DNS or WHOIS record (such as a domain's email provider or DNS host). This tier is
**disabled by default** and does nothing unless you turn it on:

- You can open an **external** DNS/WHOIS tool in a new tab — **you** make that
	request, in your own tab.
- Or you can grant an optional permission so specio performs the lookup and shows
	the result in its panel. Chrome asks for that permission explicitly; a default
	install grants none.

Even then, only the raw record lookup uses the network; the mapping from a record
to a friendly label is a table bundled in the extension.

## Data storage

Detection results are cached **only in memory, per tab, on your device**. The
cache is never synced and is cleared automatically when the tab closes; you can
also clear it manually at any time.

## Contact

Questions or concerns: open an issue at
<https://github.com/Glyndor/specio/issues>.
