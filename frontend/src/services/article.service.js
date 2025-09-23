import apiClient from "./axios.config.js";

/**
 * Article service
 */
export const getAll = (params) => apiClient.get("/articles", { params });

export const getById = (id, params) => apiClient.get(`/articles/${id}`, { params });

export const getByTag = (tagId, params) => apiClient.get("/articles", { params: { ...params, tag: tagId } });
