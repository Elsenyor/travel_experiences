import apiClient from "./axios.config.js";

/**
 * Booking service
 */
export const getAll = () => apiClient.get("/bookings");

export const getById = (id) => apiClient.get(`/bookings/${id}`);

export const create = (data) => apiClient.post("/bookings", data);

export const cancel = (id) => apiClient.patch(`/bookings/${id}/cancel`);
