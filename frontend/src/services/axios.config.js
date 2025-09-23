import axios from "axios";

// API URL from environment variables or default
const API_URL = import.meta.env.VITE_API_URL;

// Create axios instance with default config
const apiClient = axios.create({
	baseURL: API_URL,
	withCredentials: true, // Important for cookies
	headers: {
		"Content-Type": "application/json",
	},
});

// Request interceptor for adding token
apiClient.interceptors.request.use(
	(config) => {
		// You can add additional headers here if needed
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// Response interceptor for handling errors
apiClient.interceptors.response.use(
	(response) => {
		return response;
	},
	async (error) => {
		const originalRequest = error.config;

		// If error is 401 and not already retrying
		if (error.response?.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true;

			try {
				// Try to refresh the token
				await axios.post(`${API_URL}/auth/refresh-token`, {}, { withCredentials: true });

				// Retry the original request
				return apiClient(originalRequest);
			} catch (refreshError) {
				// If refresh fails, redirect to login
				window.location.href = "/login";
				return Promise.reject(refreshError);
			}
		}

		return Promise.reject(error);
	}
);

export default apiClient;
