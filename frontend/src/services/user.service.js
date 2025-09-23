import apiClient from "./axios.config.js";

/**
 * User service
 */
export const getProfile = () => apiClient.get("/users/me");

export const updateProfile = (data) => apiClient.patch("/users/me", data);

export const changePassword = (data) => apiClient.patch("/users/password", data);
