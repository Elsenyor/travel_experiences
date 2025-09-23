import { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

/* eslint-disable react-refresh/only-export-components */
// Create the authentication context
export const AuthContext = createContext(null);

// API URL from environment variables or default
const API_URL = import.meta.env.VITE_API_URL;

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// Check if user is already logged in on mount
	useEffect(() => {
		const checkAuth = async () => {
			try {
				setLoading(true);
				// Try to get current user data using the refresh token (stored in HTTP-only cookie)
				const response = await axios.get(`${API_URL}/auth/me`, {
					withCredentials: true, // Important for cookies
				});

				if (response.data.status === "success") {
					setUser(response.data.data);
				}
			} catch (err) {
				// If error, user is not authenticated
				//toast error subtitute console.error
				console.error(err);
				setUser(null);
			} finally {
				setLoading(false);
			}
		};

		checkAuth();
	}, []);

	// Login function
	const login = useCallback(async (email, password) => {
		try {
			setLoading(true);
			setError(null);

			const response = await axios.post(
				`${API_URL}/auth/login`,
				{ email, password },
				{ withCredentials: true } // Important for cookies
			);

			if (response.data.status === "success") {
				setUser(response.data.data.user);
				return true;
			}
		} catch (err) {
			setError(err.response?.data?.message || "Error al iniciar sesión");
			return false;
		} finally {
			setLoading(false);
		}
	}, []);

	// Register function
	const register = useCallback(async (userData) => {
		try {
			setLoading(true);
			setError(null);

			const response = await axios.post(`${API_URL}/auth/register`, userData, { withCredentials: true });

			if (response.data.status === "success") {
				setUser(response.data.data.user);
				return true;
			}
		} catch (err) {
			setError(err.response?.data?.message || "Error al registrarse");
			return false;
		} finally {
			setLoading(false);
		}
	}, []);

	// Google login function
	const googleLogin = useCallback(async (tokenId) => {
		try {
			setLoading(true);
			setError(null);

			const response = await axios.post(`${API_URL}/auth/google/login`, { tokenId }, { withCredentials: true });

			if (response.data.status === "success") {
				setUser(response.data.data.user);
				return true;
			}
		} catch (err) {
			setError(err.response?.data?.message || "Error al iniciar sesión con Google");
			return false;
		} finally {
			setLoading(false);
		}
	}, []);

	// Logout function
	const logout = useCallback(async () => {
		try {
			setLoading(true);

			await axios.post(`${API_URL}/auth/logout`, {}, { withCredentials: true });

			setUser(null);
			return true;
		} catch (err) {
			setError(err.response?.data?.message || "Error al cerrar sesión");
			return false;
		} finally {
			setLoading(false);
		}
	}, []);

	// Update user data
	const updateUser = useCallback(async (userData) => {
		try {
			setLoading(true);
			setError(null);

			const response = await axios.patch(`${API_URL}/users/me`, userData, { withCredentials: true });

			if (response.data.status === "success") {
				setUser(response.data.data);
				return true;
			}
		} catch (err) {
			setError(err.response?.data?.message || "Error al actualizar datos");
			return false;
		} finally {
			setLoading(false);
		}
	}, []);

	// Change password
	const changePassword = useCallback(async (currentPassword, newPassword) => {
		try {
			setLoading(true);
			setError(null);

			const response = await axios.patch(`${API_URL}/users/password`, { currentPassword, newPassword }, { withCredentials: true });

			if (response.data.status === "success") {
				return true;
			}
		} catch (err) {
			setError(err.response?.data?.message || "Error al cambiar contraseña");
			return false;
		} finally {
			setLoading(false);
		}
	}, []);

	// Clear error
	const clearError = useCallback(() => {
		setError(null);
	}, []);

	// Context value
	const value = {
		user,
		loading,
		error,
		login,
		register,
		googleLogin,
		logout,
		updateUser,
		changePassword,
		clearError,
		isAuthenticated: !!user,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
