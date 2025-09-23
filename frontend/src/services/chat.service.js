import apiClient from "./axios.config.js";

/**
 * Chat service
 */
export const getConversation = (id) => apiClient.get(`/chat/conversations/${id}`);

export const sendMessage = (conversationId, data) => apiClient.post(`/chat/conversations/${conversationId}/messages`, data);

export const startConversation = () => apiClient.post("/chat/conversations");
