import { HashRouter, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Modal from './components/modal/Modal';
import DemoPage from './routes/DemoPage';
import DocsPage from './routes/DocsPage';
import HistoryPage from './routes/HistoryPage';
import HomePage from './routes/HomePage';
import OpenPage from './routes/OpenPage';
import RecordPage from './routes/RecordPage';
import SettingsPage from './routes/SettingsPage';

function App() {
    return (
        <HashRouter>
            <div className="h-screen w-full flex bg-background">
                <Sidebar />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <Header />
                    <div className="flex-1 overflow-y-auto">
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/record" element={<RecordPage />} />
                            <Route path="/open" element={<OpenPage />} />
                            <Route path="/demo" element={<DemoPage />} />
                            <Route path="/settings" element={<SettingsPage />} />
                            <Route path="/history" element={<HistoryPage />} />
                            <Route path="/docs" element={<DocsPage />} />
                        </Routes>
                    </div>
                </div>
            </div>
            <Modal />
        </HashRouter>
    );
}

export default App;
