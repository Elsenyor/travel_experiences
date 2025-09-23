import apiClient from "./axios.config.js";

/**
 * Authentication service
 */
export const login = (data) => apiClient.post("/auth/login", data);

export const register = (data) => apiClient.post("/auth/register", data);

export const googleLogin = (tokenId) => apiClient.post("/auth/google/login", { tokenId });

export const logout = () => apiClient.post("/auth/logout");

export const getCurrentUser = () => apiClient.get("/auth/me");

export const refreshToken = () => apiClient.post("/auth/refresh-token");
