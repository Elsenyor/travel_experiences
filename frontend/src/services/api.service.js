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

// API service methods
const apiService = {
	// Auth endpoints
	auth: {
		login: (data) => apiClient.post("/auth/login", data),
		register: (data) => apiClient.post("/auth/register", data),
		googleLogin: (tokenId) => apiClient.post("/auth/google/login", { tokenId }),
		logout: () => apiClient.post("/auth/logout"),
		me: () => apiClient.get("/auth/me"),
		refreshToken: () => apiClient.post("/auth/refresh-token"),
	},

	// User endpoints
	users: {
		getProfile: () => apiClient.get("/users/me"),
		updateProfile: (data) => apiClient.patch("/users/me", data),
		changePassword: (data) => apiClient.patch("/users/password", data),
	},

	// Trips endpoints
	trips: {
		getAll: (params) => apiClient.get("/trips", { params }),
		getById: (id, params) => apiClient.get(`/trips/${id}`, { params }),
		getFeatured: (params) => apiClient.get("/trips", { params: { ...params, featured: true } }),
	},

	// Articles endpoints
	articles: {
		getAll: (params) => apiClient.get("/articles", { params }),
		getById: (id, params) => apiClient.get(`/articles/${id}`, { params }),
		getByTag: (tagId, params) => apiClient.get("/articles", { params: { ...params, tag: tagId } }),
	},

	// Bookings endpoints
	bookings: {
		getAll: () => apiClient.get("/bookings"),
		getById: (id) => apiClient.get(`/bookings/${id}`),
		create: (data) => apiClient.post("/bookings", data),
		cancel: (id) => apiClient.patch(`/bookings/${id}/cancel`),
	},

	// Newsletter endpoints
	newsletter: {
		subscribe: (data) => apiClient.post("/newsletter/subscribers", data),
		unsubscribe: (email) => apiClient.delete(`/newsletter/subscribers/${email}`),
	},

	// Chat endpoints
	chat: {
		getConversation: (id) => apiClient.get(`/chat/conversations/${id}`),
		sendMessage: (conversationId, data) => apiClient.post(`/chat/conversations/${conversationId}/messages`, data),
		startConversation: () => apiClient.post("/chat/conversations"),
	},

	// FAQ endpoints
	faqs: {
		getAll: (params) => apiClient.get("/faqs", { params }),
		search: (query, params) => apiClient.get("/faqs", { params: { ...params, q: query } }),
	},
};

export default apiService;
