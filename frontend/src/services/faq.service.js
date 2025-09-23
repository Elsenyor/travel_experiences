import apiClient from "./axios.config.js";

/**
 * FAQ service
 */
export const getAll = (params) => apiClient.get("/faqs", { params });

export const search = (query, params) => apiClient.get("/faqs", { params: { ...params, q: query } });
