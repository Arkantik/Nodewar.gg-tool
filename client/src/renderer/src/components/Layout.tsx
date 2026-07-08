import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import TitleBar from "./TitleBar";

function Layout() {
	return (
		<div className="h-screen w-full flex flex-col bg-background">
			<TitleBar />
			<div className="flex-1 flex overflow-hidden">
				<Sidebar />
				<div className="flex-1 flex flex-col overflow-hidden relative">
					<div className="absolute top-20 right-20 w-64 h-64 bg-cta-500/10 rounded-full blur-3xl animate-float-1 pointer-events-none"></div>
					<div className="absolute bottom-20 left-20 w-64 h-64 bg-cta-500/5 rounded-full blur-3xl animate-float-2 pointer-events-none" style={{ animationDelay: "2s" }}></div>
					<div className="relative z-20">
						<Header />
					</div>
					<div className="flex-1 overflow-y-auto relative z-10">
						<Outlet />
					</div>
				</div>
			</div>
		</div>
	);
}

export default Layout;
