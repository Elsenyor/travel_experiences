import dbPool from "../utils/database.pool.js";
import { generateUUID } from "../utils/uuid.service.js";

/**
 * Find conversation by ID
 * @param {string} id - Conversation ID
 * @returns {Promise<Object|null>} Conversation object or null if not found
 */
export const findById = async (id) => {
	try {
		const query = `
      SELECT id, user_id, status, start_date, end_date
      FROM chat_conversations
      WHERE id = ?
    `;
		const conversations = await dbPool.executeQuery(query, [id]);
		return conversations[0] || null;
	} catch (error) {
		throw new Error(`Error finding conversation: ${error.message}`);
	}
};

/**
 * Find conversations by user ID
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @param {number} options.limit - Results limit
 * @param {number} options.offset - Results offset
 * @returns {Promise<Array>} Array of conversation objects
 */
export const findByUserId = async (userId, { limit = 10, offset = 0 } = {}) => {
	try {
		const query = `
      SELECT id, user_id, status, start_date, end_date
      FROM chat_conversations
      WHERE user_id = ?
      ORDER BY start_date DESC
      LIMIT ? OFFSET ?
    `;
		return await dbPool.executeQuery(query, [userId, parseInt(limit), parseInt(offset)]);
	} catch (error) {
		throw new Error(`Error finding user conversations: ${error.message}`);
	}
};

/**
 * Count conversations by user ID
 * @param {string} userId - User ID
 * @returns {Promise<number>} Count of conversations
 */
export const countByUserId = async (userId) => {
	try {
		const query = `
      SELECT COUNT(*) as count
      FROM chat_conversations
      WHERE user_id = ?
    `;
		const result = await dbPool.executeQuery(query, [userId]);
		return result[0].count;
	} catch (error) {
		throw new Error(`Error counting user conversations: ${error.message}`);
	}
};

/**
 * Find all conversations with pagination
 * @param {Object} options - Query options
 * @param {string} options.status - Filter by status
 * @param {number} options.limit - Results limit
 * @param {number} options.offset - Results offset
 * @returns {Promise<Array>} Array of conversation objects
 */
export const findAll = async ({ status, limit = 10, offset = 0 } = {}) => {
	try {
		let query = `
      SELECT c.id, c.user_id, c.status, c.start_date, c.end_date, 
             u.name as user_name, u.email as user_email
      FROM chat_conversations c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE 1=1
    `;

		const values = [];

		if (status) {
			query += " AND c.status = ?";
			values.push(status);
		}

		query += " ORDER BY c.start_date DESC LIMIT ? OFFSET ?";
		values.push(parseInt(limit), parseInt(offset));

		return await dbPool.executeQuery(query, values);
	} catch (error) {
		throw new Error(`Error finding conversations: ${error.message}`);
	}
};

/**
 * Count all conversations
 * @param {Object} options - Query options
 * @param {string} options.status - Filter by status
 * @returns {Promise<number>} Count of conversations
 */
export const countAll = async ({ status } = {}) => {
	try {
		let query = `
      SELECT COUNT(*) as count
      FROM chat_conversations
      WHERE 1=1
    `;

		const values = [];

		if (status) {
			query += " AND status = ?";
			values.push(status);
		}

		const result = await dbPool.executeQuery(query, values);
		return result[0].count;
	} catch (error) {
		throw new Error(`Error counting conversations: ${error.message}`);
	}
};

/**
 * Create new conversation
 * @param {Object} data - Conversation data
 * @param {string} [data.user_id] - User ID (optional for anonymous chats)
 * @returns {Promise<string>} Created conversation ID
 */
export const create = async ({ user_id = null } = {}) => {
	try {
		const id = generateUUID();
		const query = `
      INSERT INTO chat_conversations (id, user_id, status, start_date)
      VALUES (?, ?, 'open', NOW())
    `;
		await dbPool.executeQuery(query, [id, user_id]);
		return id;
	} catch (error) {
		throw new Error(`Error creating conversation: ${error.message}`);
	}
};

/**
 * Update conversation status
 * @param {string} id - Conversation ID
 * @param {string} status - New status ('open' or 'closed')
 * @returns {Promise<void>}
 */
export const updateStatus = async (id, status) => {
	try {
		let query;
		if (status === "closed") {
			query = `
        UPDATE chat_conversations
        SET status = ?, end_date = NOW()
        WHERE id = ?
      `;
		} else {
			query = `
        UPDATE chat_conversations
        SET status = ?, end_date = NULL
        WHERE id = ?
      `;
		}
		await dbPool.executeQuery(query, [status, id]);
	} catch (error) {
		throw new Error(`Error updating conversation status: ${error.message}`);
	}
};

/**
 * Delete conversation
 * @param {string} id - Conversation ID
 * @returns {Promise<void>}
 */
export const remove = async (id) => {
	try {
		const query = `
      DELETE FROM chat_conversations
      WHERE id = ?
    `;
		await dbPool.executeQuery(query, [id]);
	} catch (error) {
		throw new Error(`Error deleting conversation: ${error.message}`);
	}
};

export default {
	findById,
	findByUserId,
	countByUserId,
	findAll,
	countAll,
	create,
	updateStatus,
	remove,
};
