import { Outlet } from "react-router-dom";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

/**
 * MainLayout component
 * This component provides the main layout for the application
 * It includes the header, main content area, and footer
 */
const MainLayout = () => {
	return (
		<div className="d-flex flex-column min-vh-100">
			{/* Header */}
			<Header />

			{/* Main content */}
			<main className="flex-grow-1">
				<Outlet />
			</main>

			{/* Footer */}
			<Footer />
		</div>
	);
};

export default MainLayout;
