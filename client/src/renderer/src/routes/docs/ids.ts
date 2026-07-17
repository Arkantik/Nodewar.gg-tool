export const TROUBLESHOOTING_IDS = {
	startupIssues: "docs-startup-issues",
	pathError: "docs-path-error",
	noLogs: "docs-no-logs",
	wrongNames: "docs-wrong-names",
	cantSave: "docs-cant-save",
	overlayFullscreen: "docs-overlay-fullscreen",
} as const;

export const FAQ_IDS = {
	safe: "docs-faq-safe",
	banned: "docs-faq-banned",
	outdatedConfig: "docs-faq-outdated-config",
	anyPvp: "docs-faq-any-pvp",
	editLogs: "docs-faq-edit-logs",
	accidentalClose: "docs-faq-accidental-close",
} as const;

export const ALL_DOCS_SECTION_IDS: string[] = [...Object.values(TROUBLESHOOTING_IDS), ...Object.values(FAQ_IDS)];
