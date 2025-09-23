import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

// Material UI components
import { Box, CircularProgress } from "@mui/material";

/**
 * ProtectedRoute component
 * This component protects routes that require authentication
 */
const ProtectedRoute = () => {
	const { isAuthenticated, loading } = useAuth();

	// Show loading spinner while checking authentication
	if (loading) {
		return (
			<Box
				sx={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					height: "100vh",
				}}
			>
				<CircularProgress />
			</Box>
		);
	}

	// Redirect to login if not authenticated
	if (!isAuthenticated) {
		return <Navigate to="/auth/login" replace />;
	}

	// Render child routes if authenticated
	return <Outlet />;
};

export default ProtectedRoute;
