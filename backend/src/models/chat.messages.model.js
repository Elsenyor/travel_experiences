import dbPool from "../utils/database.pool.js";
import { generateUUID } from "../utils/uuid.service.js";

/**
 * Find message by ID
 * @param {string} id - Message ID
 * @returns {Promise<Object|null>} Message object or null if not found
 */
export const findById = async (id) => {
	try {
		const query = `
      SELECT id, conversation_id, sender, message, created_at
      FROM chat_messages
      WHERE id = ?
    `;
		const messages = await dbPool.executeQuery(query, [id]);
		return messages[0] || null;
	} catch (error) {
		throw new Error(`Error finding message: ${error.message}`);
	}
};

/**
 * Find messages by conversation ID
 * @param {string} conversationId - Conversation ID
 * @param {Object} options - Query options
 * @param {number} options.limit - Results limit
 * @param {number} options.offset - Results offset
 * @returns {Promise<Array>} Array of message objects
 */
export const findByConversationId = async (conversationId, { limit = 50, offset = 0 } = {}) => {
	try {
		const query = `
      SELECT id, conversation_id, sender, message, created_at
      FROM chat_messages
      WHERE conversation_id = ?
      ORDER BY created_at ASC
      LIMIT ? OFFSET ?
    `;
		return await dbPool.executeQuery(query, [conversationId, parseInt(limit), parseInt(offset)]);
	} catch (error) {
		throw new Error(`Error finding conversation messages: ${error.message}`);
	}
};

/**
 * Count messages by conversation ID
 * @param {string} conversationId - Conversation ID
 * @returns {Promise<number>} Count of messages
 */
export const countByConversationId = async (conversationId) => {
	try {
		const query = `
      SELECT COUNT(*) as count
      FROM chat_messages
      WHERE conversation_id = ?
    `;
		const result = await dbPool.executeQuery(query, [conversationId]);
		return result[0].count;
	} catch (error) {
		throw new Error(`Error counting conversation messages: ${error.message}`);
	}
};

/**
 * Create new message
 * @param {Object} data - Message data
 * @param {string} data.conversation_id - Conversation ID
 * @param {string} data.sender - Sender type ('user', 'bot', or 'admin')
 * @param {string} data.message - Message content
 * @returns {Promise<string>} Created message ID
 */
export const create = async ({ conversation_id, sender, message }) => {
	try {
		const id = generateUUID();
		const query = `
      INSERT INTO chat_messages (id, conversation_id, sender, message)
      VALUES (?, ?, ?, ?)
    `;
		await dbPool.executeQuery(query, [id, conversation_id, sender, message]);
		return id;
	} catch (error) {
		throw new Error(`Error creating message: ${error.message}`);
	}
};

/**
 * Delete message
 * @param {string} id - Message ID
 * @returns {Promise<void>}
 */
export const remove = async (id) => {
	try {
		const query = `
      DELETE FROM chat_messages
      WHERE id = ?
    `;
		await dbPool.executeQuery(query, [id]);
	} catch (error) {
		throw new Error(`Error deleting message: ${error.message}`);
	}
};

/**
 * Get last message from conversation
 * @param {string} conversationId - Conversation ID
 * @returns {Promise<Object|null>} Last message or null if none
 */
export const getLastMessage = async (conversationId) => {
	try {
		const query = `
      SELECT id, conversation_id, sender, message, created_at
      FROM chat_messages
      WHERE conversation_id = ?
      ORDER BY created_at DESC
      LIMIT 1
    `;
		const messages = await dbPool.executeQuery(query, [conversationId]);
		return messages[0] || null;
	} catch (error) {
		throw new Error(`Error finding last message: ${error.message}`);
	}
};

export default {
	findById,
	findByConversationId,
	countByConversationId,
	create,
	remove,
	getLastMessage,
};
