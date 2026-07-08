import LanguageSelector from "./LanguageSelector";
import RecordingIndicator from "./RecordingIndicator";
import SystemStatusIndicator from "./SystemStatusIndicator";

function Header() {
	return (
		<header className="chrome-panel flex items-center justify-end gap-3 px-6 py-1.5 border-b-0">
			<RecordingIndicator />
			<SystemStatusIndicator />
			<LanguageSelector />
		</header>
	);
}

export default Header;
