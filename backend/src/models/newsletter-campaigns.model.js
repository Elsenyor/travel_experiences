import dbPool from "../utils/database.pool.js";

/**
 * Find campaign by ID
 * @param {number} id - Campaign ID
 * @returns {Promise<Object|null>} Campaign object or null if not found
 */
export const findById = async (id) => {
	const query = "SELECT id, language, subject, content, sent_date, created_at, updated_at FROM newsletter_campaigns WHERE id = ?";
	try {
		const campaign = await dbPool.executeQuery(query, [id]);
		return campaign[0] || null;
	} catch (error) {
		throw new Error(`Error finding campaign: ${error.message}`);
	}
};

/**
 * Create new campaign
 * @param {Object} campaignData - Campaign data
 * @param {string} campaignData.language - Campaign language
 * @param {string} campaignData.subject - Email subject
 * @param {string} campaignData.content - Email content
 * @returns {Promise<number>} Created campaign ID
 */
export const create = async ({ language, subject, content }) => {
	const query = "INSERT INTO newsletter_campaigns (language, subject, content) VALUES (?, ?, ?)";
	try {
		const result = await dbPool.executeQuery(query, [language, subject, content]);
		return result.insertId;
	} catch (error) {
		throw new Error(`Error creating campaign: ${error.message}`);
	}
};

/**
 * Update campaign data
 * @param {number} id - Campaign ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<boolean>} True if updated, false otherwise
 */
export const update = async (id, updateData) => {
	const allowedFields = ["language", "subject", "content"];
	const updates = [];
	const values = [];

	Object.keys(updateData).forEach((key) => {
		if (allowedFields.includes(key)) {
			updates.push(`${key} = ?`);
			values.push(updateData[key]);
		}
	});

	if (updates.length === 0) return null;

	values.push(id);
	const query = `UPDATE newsletter_campaigns SET ${updates.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;

	try {
		const result = await dbPool.executeQuery(query, values);
		return result.affectedRows > 0;
	} catch (error) {
		throw new Error(`Error updating campaign: ${error.message}`);
	}
};

/**
 * Mark campaign as sent
 * @param {number} id - Campaign ID
 * @returns {Promise<boolean>} True if updated, false otherwise
 */
export const markAsSent = async (id) => {
	const query = "UPDATE newsletter_campaigns SET sent_date = CURRENT_TIMESTAMP WHERE id = ?";
	try {
		const result = await dbPool.executeQuery(query, [id]);
		return result.affectedRows > 0;
	} catch (error) {
		throw new Error(`Error marking campaign as sent: ${error.message}`);
	}
};

/**
 * Remove campaign
 * @param {number} id - Campaign ID
 * @returns {Promise<boolean>} True if removed, false otherwise
 */
export const remove = async (id) => {
	const query = "DELETE FROM newsletter_campaigns WHERE id = ?";
	try {
		const result = await dbPool.executeQuery(query, [id]);
		return result.affectedRows > 0;
	} catch (error) {
		throw new Error(`Error deleting campaign: ${error.message}`);
	}
};

/**
 * Find campaigns by multiple criteria
 * @param {Object} filters - Search filters
 * @param {string} filters.language - Filter by language
 * @param {boolean} filters.sent - Filter by sent status
 * @param {string} filters.search - Search in subject
 * @param {number} filters.limit - Results limit
 * @param {number} filters.offset - Results offset
 * @param {string} filters.sortField - Field to sort by
 * @param {string} filters.sortOrder - Sort order (ASC or DESC)
 * @returns {Promise<Array>} Array of campaigns
 */
export const findByFilters = async ({ language, sent, search, limit = 10, offset = 0, sortField = "created_at", sortOrder = "DESC" }) => {
	let query = "SELECT id, language, subject, content, sent_date, created_at, updated_at FROM newsletter_campaigns WHERE 1=1";
	const values = [];

	if (language) {
		query += " AND language = ?";
		values.push(language);
	}

	if (sent !== undefined) {
		if (sent) {
			query += " AND sent_date IS NOT NULL";
		} else {
			query += " AND sent_date IS NULL";
		}
	}

	if (search) {
		query += " AND subject LIKE ?";
		values.push(`%${search}%`);
	}

	// Validate sort field to prevent SQL injection
	const allowedSortFields = ["id", "language", "subject", "sent_date", "created_at", "updated_at"];
	const validSortField = allowedSortFields.includes(sortField) ? sortField : "created_at";

	// Validate sort order
	const validSortOrder = ["ASC", "DESC"].includes(sortOrder) ? sortOrder : "DESC";

	query += ` ORDER BY ${validSortField} ${validSortOrder} LIMIT ? OFFSET ?`;
	values.push(parseInt(limit), parseInt(offset));

	try {
		return await dbPool.executeQuery(query, values);
	} catch (error) {
		throw new Error(`Error searching campaigns: ${error.message}`);
	}
};

/**
 * Count total campaigns matching filters (for pagination)
 * @param {Object} filters - Search filters (same as findByFilters but without limit/offset)
 * @returns {Promise<number>} Total count of matching campaigns
 */
export const countByFilters = async ({ language, sent, search }) => {
	let query = "SELECT COUNT(*) as total FROM newsletter_campaigns WHERE 1=1";
	const values = [];

	if (language) {
		query += " AND language = ?";
		values.push(language);
	}

	if (sent !== undefined) {
		if (sent) {
			query += " AND sent_date IS NOT NULL";
		} else {
			query += " AND sent_date IS NULL";
		}
	}

	if (search) {
		query += " AND subject LIKE ?";
		values.push(`%${search}%`);
	}

	try {
		const result = await dbPool.executeQuery(query, values);
		return result[0].total;
	} catch (error) {
		throw new Error(`Error counting campaigns: ${error.message}`);
	}
};

/**
 * Get unsent campaigns by language
 * @param {string} language - Language code
 * @returns {Promise<Array>} Array of unsent campaigns
 */
export const getUnsentByLanguage = async (language) => {
	const query = "SELECT id, language, subject, content FROM newsletter_campaigns WHERE sent_date IS NULL AND language = ?";
	try {
		return await dbPool.executeQuery(query, [language]);
	} catch (error) {
		throw new Error(`Error getting unsent campaigns: ${error.message}`);
	}
};

export default {
	findById,
	create,
	update,
	markAsSent,
	remove,
	findByFilters,
	countByFilters,
	getUnsentByLanguage,
};

