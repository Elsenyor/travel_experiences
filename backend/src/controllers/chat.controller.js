import conversationsModel from "../models/chat.conversations.model.js";
import messagesModel from "../models/chat.messages.model.js";
import faqModel from "../models/faq.model.js";
import { formatResponse, formatErrorResponse } from "../utils/response.formatter.js";

/**
 * Get all conversations with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getAllConversations = async (req, res) => {
	try {
		const { _start = 0, _end = 10, status } = req.query;

		const limit = parseInt(_end) - parseInt(_start);
		const offset = parseInt(_start);

		// Get conversations with filters
		const conversations = await conversationsModel.findAll({
			status,
			limit,
			offset,
		});

		// Get total count for Content-Range header
		const total = await conversationsModel.countAll({ status });

		// Set Content-Range header for React Admin
		res.set("Content-Range", `conversations ${_start}-${Math.min(total, _end - 1)}/${total}`);
		res.set("X-Total-Count", total.toString());

		return formatResponse(res, conversations);
	} catch (error) {
		return formatErrorResponse(res, error.message, 500);
	}
};

/**
 * Get user conversations
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getUserConversations = async (req, res) => {
	try {
		const { userId } = req.params;
		const { _start = 0, _end = 10 } = req.query;

		const limit = parseInt(_end) - parseInt(_start);
		const offset = parseInt(_start);

		// Get user conversations
		const conversations = await conversationsModel.findByUserId(userId, {
			limit,
			offset,
		});

		// Get total count for Content-Range header
		const total = await conversationsModel.countByUserId(userId);

		// Set Content-Range header for React Admin
		res.set("Content-Range", `conversations ${_start}-${Math.min(total, _end - 1)}/${total}`);
		res.set("X-Total-Count", total.toString());

		return formatResponse(res, conversations);
	} catch (error) {
		return formatErrorResponse(res, error.message, 500);
	}
};

/**
 * Get conversation by ID with messages
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getConversationById = async (req, res) => {
	try {
		const { id } = req.params;
		const { _start = 0, _end = 50 } = req.query;

		const limit = parseInt(_end) - parseInt(_start);
		const offset = parseInt(_start);

		// Get conversation
		const conversation = await conversationsModel.findById(id);

		if (!conversation) {
			return formatErrorResponse(res, "Conversation not found", 404);
		}

		// Get messages
		const messages = await messagesModel.findByConversationId(id, {
			limit,
			offset,
		});

		// Get total count for Content-Range header
		const totalMessages = await messagesModel.countByConversationId(id);

		// Set Content-Range header for messages
		res.set("Content-Range", `messages ${_start}-${Math.min(totalMessages, _end - 1)}/${totalMessages}`);
		res.set("X-Total-Count", totalMessages.toString());

		// Add messages to conversation
		conversation.messages = messages;

		return formatResponse(res, conversation);
	} catch (error) {
		return formatErrorResponse(res, error.message, 500);
	}
};

/**
 * Create new conversation
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const createConversation = async (req, res) => {
	try {
		// Get user ID from authenticated user or use anonymous chat
		const user_id = req.user?.id || null;

		// Create conversation
		const conversationId = await conversationsModel.create({ user_id });

		// Get created conversation
		const conversation = await conversationsModel.findById(conversationId);

		return formatResponse(res, conversation, 201);
	} catch (error) {
		return formatErrorResponse(res, error.message, 500);
	}
};

/**
 * Update conversation status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const updateConversationStatus = async (req, res) => {
	try {
		const { id } = req.params;
		const { status } = req.body;

		if (!status || !["open", "closed"].includes(status)) {
			return formatErrorResponse(res, "Invalid status", 400);
		}

		// Check if conversation exists
		const existingConversation = await conversationsModel.findById(id);
		if (!existingConversation) {
			return formatErrorResponse(res, "Conversation not found", 404);
		}

		// Update status
		await conversationsModel.updateStatus(id, status);

		// Get updated conversation
		const updatedConversation = await conversationsModel.findById(id);

		return formatResponse(res, updatedConversation);
	} catch (error) {
		return formatErrorResponse(res, error.message, 500);
	}
};

/**
 * Delete conversation
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const deleteConversation = async (req, res) => {
	try {
		const { id } = req.params;

		// Check if conversation exists
		const existingConversation = await conversationsModel.findById(id);
		if (!existingConversation) {
			return formatErrorResponse(res, "Conversation not found", 404);
		}

		// Delete conversation (this will cascade delete messages)
		await conversationsModel.remove(id);

		return formatResponse(res, { message: "Conversation deleted successfully" });
	} catch (error) {
		return formatErrorResponse(res, error.message, 500);
	}
};

/**
 * Get conversation messages
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getConversationMessages = async (req, res) => {
	try {
		const { id } = req.params;
		const { _start = 0, _end = 50 } = req.query;

		const limit = parseInt(_end) - parseInt(_start);
		const offset = parseInt(_start);

		// Check if conversation exists
		const existingConversation = await conversationsModel.findById(id);
		if (!existingConversation) {
			return formatErrorResponse(res, "Conversation not found", 404);
		}

		// Get messages
		const messages = await messagesModel.findByConversationId(id, {
			limit,
			offset,
		});

		// Get total count for Content-Range header
		const total = await messagesModel.countByConversationId(id);

		// Set Content-Range header for React Admin
		res.set("Content-Range", `messages ${_start}-${Math.min(total, _end - 1)}/${total}`);
		res.set("X-Total-Count", total.toString());

		return formatResponse(res, messages);
	} catch (error) {
		return formatErrorResponse(res, error.message, 500);
	}
};

/**
 * Add message to conversation
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const addMessage = async (req, res) => {
	try {
		const { id } = req.params;
		const { message, sender = "user" } = req.body;

		if (!message) {
			return formatErrorResponse(res, "Message is required", 400);
		}

		// Check if conversation exists
		const existingConversation = await conversationsModel.findById(id);
		if (!existingConversation) {
			return formatErrorResponse(res, "Conversation not found", 404);
		}

		// Check if conversation is open
		if (existingConversation.status === "closed") {
			return formatErrorResponse(res, "Cannot add message to closed conversation", 400);
		}

		// Add message
		const messageId = await messagesModel.create({
			conversation_id: id,
			sender,
			message,
		});

		// Get created message
		const createdMessage = await messagesModel.findById(messageId);

		// If this is a user message, generate a bot response
		if (sender === "user") {
			// In a real implementation, this would call an AI service or similar
			// For now, we'll just add a simple bot response
			await generateBotResponse(id, message);
		}

		return formatResponse(res, createdMessage, 201);
	} catch (error) {
		return formatErrorResponse(res, error.message, 500);
	}
};

/**
 * Delete message
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const deleteMessage = async (req, res) => {
	try {
		const { id, messageId } = req.params;

		// Check if conversation exists
		const existingConversation = await conversationsModel.findById(id);
		if (!existingConversation) {
			return formatErrorResponse(res, "Conversation not found", 404);
		}

		// Check if message exists and belongs to conversation
		const message = await messagesModel.findById(messageId);
		if (!message || message.conversation_id !== id) {
			return formatErrorResponse(res, "Message not found in this conversation", 404);
		}

		// Delete message
		await messagesModel.remove(messageId);

		return formatResponse(res, { message: "Message deleted successfully" });
	} catch (error) {
		return formatErrorResponse(res, error.message, 500);
	}
};

/**
 * Generate bot response based on user message
 * @param {string} conversationId - Conversation ID
 * @param {string} userMessage - User message
 * @returns {Promise<string>} Bot message ID
 */
async function generateBotResponse(conversationId, userMessage) {
	try {
		// In a real implementation, this would use NLP, AI, or similar
		// For now, we'll just check for keywords and provide simple responses

		// Check if message contains FAQ keywords
		const lowerMessage = userMessage.toLowerCase();
		let botResponse = "Lo siento, no puedo responder a eso en este momento. ¿Puedo ayudarte con algo más?";

		// Simple keyword matching - in a real implementation, use a proper NLP approach
		if (lowerMessage.includes("hora") && lowerMessage.includes("abiert")) {
			botResponse = "Nuestro horario de atención es de lunes a viernes de 9:00 a 18:00.";
		} else if (lowerMessage.includes("reserv")) {
			botResponse = "Puedes hacer una reserva directamente desde nuestra página de viajes. ¿Necesitas ayuda con algún viaje específico?";
		} else if (lowerMessage.includes("cancel")) {
			botResponse =
				"Para cancelaciones, por favor contacta con nuestro equipo de atención al cliente al +34 911 222 333 o envía un email a cancelaciones@asiaexperiences.com.";
		} else if (lowerMessage.includes("pag") || lowerMessage.includes("pago")) {
			botResponse = "Aceptamos tarjetas de crédito (Visa, Mastercard, American Express), PayPal y transferencias bancarias.";
		} else if (lowerMessage.includes("contact")) {
			botResponse = "Puedes contactarnos por teléfono al +34 911 222 333 o por email a info@asiaexperiences.com.";
		} else {
			// Try to find a matching FAQ
			const faqs = await faqModel.findAll({
				search: userMessage,
				limit: 1,
			});

			if (faqs.length > 0) {
				botResponse = faqs[0].answer;
			}
		}

		// Add bot response
		return await messagesModel.create({
			conversation_id: conversationId,
			sender: "bot",
			message: botResponse,
		});
	} catch (error) {
		console.error("Error generating bot response:", error);
		// If there's an error, still try to send a fallback message
		return await messagesModel.create({
			conversation_id: conversationId,
			sender: "bot",
			message: "Lo siento, ha ocurrido un error. Por favor, inténtalo de nuevo más tarde.",
		});
	}
}

export default {
	getAllConversations,
	getUserConversations,
	getConversationById,
	createConversation,
	updateConversationStatus,
	deleteConversation,
	getConversationMessages,
	addMessage,
	deleteMessage,
};
