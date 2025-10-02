import { Routes, Route, Navigate } from "react-router-dom";

// Auth components
import Login from "../components/auth/Login";
import Register from "../components/auth/Register";
import ForgotPassword from "../components/auth/ForgotPassword";
import ResetPassword from "../components/auth/ResetPassword";
import GoogleLogin from "../components/auth/GoogleLogin";
import ProtectedRoute from "../components/auth/ProtectedRoute";

// Layout components (to be created later)
import MainLayout from "../layouts/MainLayout";

// Page components (placeholders for now)
const Home = () => <div>Home Page</div>;
const Trips = () => <div>Trips Page</div>;
const TripDetail = () => <div>Trip Detail Page</div>;
const Blog = () => <div>Blog Page</div>;
const ArticleDetail = () => <div>Article Detail Page</div>;
const Profile = () => <div>Profile Page</div>;
const Bookings = () => <div>My Bookings Page</div>;
const NotFound = () => <div>404 - Page Not Found</div>;

/**
 * AppRoutes component
 * This component defines all the routes for the application
 */
const AppRoutes = () => {
	return (
		<Routes>
			{/* Public routes */}
			<Route path="/" element={<MainLayout />}>
				<Route index element={<Home />} />
				<Route path="trips" element={<Trips />} />
				<Route path="trips/:id" element={<TripDetail />} />
				<Route path="blog" element={<Blog />} />
				<Route path="blog/:id" element={<ArticleDetail />} />
			</Route>

			{/* Auth routes */}
			<Route path="/auth">
				<Route path="login" element={<Login />} />
				<Route path="register" element={<Register />} />
				<Route path="google-callback" element={<GoogleLogin />} />
			</Route>

			{/* Public auth routes */}
			<Route path="/auth/forgot-password" element={<ForgotPassword />} />
			<Route path="/auth/reset-password/:token" element={<ResetPassword />} />

			{/* Protected routes */}
			<Route element={<ProtectedRoute />}>
				<Route path="/profile" element={<Profile />} />
				<Route path="/bookings" element={<Bookings />} />
			</Route>

			{/* Redirect /auth to /auth/login */}
			<Route path="/auth" element={<Navigate to="/auth/login" replace />} />

			{/* 404 route */}
			<Route path="*" element={<NotFound />} />
		</Routes>
	);
};

export default AppRoutes;
