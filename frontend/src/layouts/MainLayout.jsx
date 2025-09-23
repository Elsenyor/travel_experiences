import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";

/**
 * MainLayout component
 * This component provides the main layout for the application
 * It will contain the header, navigation, footer, etc.
 */
const MainLayout = () => {
	return (
		<Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
			{/* Header will go here */}
			<Box component="header">{/* Navbar will go here */}</Box>

			{/* Main content */}
			<Box component="main" sx={{ flexGrow: 1, py: 3 }}>
				<Outlet />
			</Box>

			{/* Footer will go here */}
			<Box component="footer" sx={{ py: 3, bgcolor: "background.paper" }}>
				{/* Footer content will go here */}
			</Box>
		</Box>
	);
};

export default MainLayout;
