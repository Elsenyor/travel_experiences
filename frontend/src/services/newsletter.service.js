import apiClient from "./axios.config.js";

/**
 * Newsletter service
 */
export const subscribe = (data) => apiClient.post("/newsletter/subscribers", data);

export const unsubscribe = (email) => apiClient.delete(`/newsletter/subscribers/${email}`);
