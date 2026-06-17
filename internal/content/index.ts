// Content script: collects detection signals already present in the page
// (DOM markers, script URLs, meta tags) and forwards them to the service
// worker for matching. It only reads the page; nothing is sent off-device.

interface MetaSignal {
	name: string | null;
	content: string | null;
}

interface PageSignals {
	html: string;
	scripts: string[];
	metas: MetaSignal[];
}

function collectSignals(): PageSignals {
	return {
		html: document.documentElement.outerHTML,
		scripts: Array.from(document.scripts, (script) => script.src).filter(Boolean),
		metas: Array.from(document.head.querySelectorAll("meta"), (meta) => ({
			name: meta.getAttribute("name"),
			content: meta.getAttribute("content")
		}))
	};
}

chrome.runtime.sendMessage({ type: "page-signals", signals: collectSignals() });
