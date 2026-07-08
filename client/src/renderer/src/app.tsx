import { HashRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Modal from "./components/modal/Modal";
import DemoPage from "./routes/DemoPage";
import DocsPage from "./routes/DocsPage";
import HistoryPage from "./routes/HistoryPage";
import HomePage from "./routes/HomePage";
import OpenPage from "./routes/OpenPage";
import RecordPage from "./routes/RecordPage";
import SettingsPage from "./routes/SettingsPage";

function App() {
	return (
		<HashRouter>
			<Routes>
				<Route element={<Layout />}>
					<Route path="/" element={<HomePage />} />
					<Route path="/record" element={<RecordPage />} />
					<Route path="/open" element={<OpenPage />} />
					<Route path="/demo" element={<DemoPage />} />
					<Route path="/settings" element={<SettingsPage />} />
					<Route path="/history" element={<HistoryPage />} />
					<Route path="/docs" element={<DocsPage />} />
				</Route>
			</Routes>
			<Modal />
		</HashRouter>
	);
}

export default App;
