import apiClient from "./axios.config.js";

/**
 * Trip service
 */
export const getAll = (params) => apiClient.get("/trips", { params });

export const getById = (id, params) => apiClient.get(`/trips/${id}`, { params });

export const getFeatured = (params) => apiClient.get("/trips", { params: { ...params, featured: true } });
