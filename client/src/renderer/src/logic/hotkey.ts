const FUNCTION_KEY_PATTERN = /^F([1-9]|1[0-9]|2[0-4])$/;

// Maps a few punctuation/navigation KeyboardEvent.codes to the key names
// Electron's accelerator strings expect (see Electron's Accelerator docs).
// Codes reflect physical key position, not the shifted character, so e.g.
// Shift+Digit8 (US layout "*") arrives as code "Digit8", not "*".
const CODE_TO_ACCELERATOR_KEY: Record<string, string> = {
	Comma: ",",
	Period: ".",
	Slash: "/",
	Backslash: "\\",
	IntlBackslash: "\\",
	BracketLeft: "[",
	BracketRight: "]",
	Quote: "'",
	Semicolon: ";",
	Backquote: "`",
	Minus: "-",
	Equal: "=",
	Space: "Space",
	Tab: "Tab",
	Backspace: "Backspace",
	Delete: "Delete",
	Insert: "Insert",
	Home: "Home",
	End: "End",
	PageUp: "PageUp",
	PageDown: "PageDown",
	ArrowUp: "Up",
	ArrowDown: "Down",
	ArrowLeft: "Left",
	ArrowRight: "Right",
	NumpadAdd: "numadd",
	NumpadSubtract: "numsub",
	NumpadDecimal: "numdec",
	NumpadMultiply: "nummult",
	NumpadDivide: "numdiv",
};

function mainKeyFromCode(code: string): string | null {
	if (code.startsWith("Key")) return code.slice(3);
	if (code.startsWith("Digit")) return code.slice(5);
	if (/^Numpad[0-9]$/.test(code)) return `num${code.slice(6)}`;
	if (FUNCTION_KEY_PATTERN.test(code)) return code;
	return CODE_TO_ACCELERATOR_KEY[code] ?? null;
}

// Builds an Electron accelerator string (e.g. "CommandOrControl+Shift+F9")
// from a keydown event, or null if the combination isn't eligible. Letters,
// digits and punctuation need at least one modifier - Ctrl, Alt, Shift, or
// Cmd/Win all count (otherwise a global hotkey would hijack normal typing
// everywhere); bare function keys are allowed on their own.
export function acceleratorFromKeyEvent(e: KeyboardEvent): string | null {
	const mainKey = mainKeyFromCode(e.code);
	if (!mainKey) return null;

	const isFunctionKey = FUNCTION_KEY_PATTERN.test(e.code);
	const hasModifier = e.ctrlKey || e.altKey || e.metaKey || e.shiftKey;
	if (!isFunctionKey && !hasModifier) return null;

	const parts: string[] = [];
	if (e.ctrlKey || e.metaKey) parts.push("CommandOrControl");
	if (e.altKey) parts.push("Alt");
	if (e.shiftKey) parts.push("Shift");
	parts.push(mainKey);

	return parts.join("+");
}

export function formatAccelerator(accelerator: string): string {
	return accelerator.replaceAll("CommandOrControl", "Ctrl").replaceAll("+", " + ");
}
