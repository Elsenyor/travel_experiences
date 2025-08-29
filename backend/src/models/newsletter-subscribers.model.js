import dbPool from "../utils/database.pool.js";

/**
 * Find subscriber by ID
 * @param {number} id - Subscriber ID
 * @returns {Promise<Object|null>} Subscriber object or null if not found
 */
export const findById = async (id) => {
	const query = "SELECT id, email, preferred_language, status, subscription_date, updated_at FROM newsletter_subscribers WHERE id = ?";
	try {
		const subscriber = await dbPool.executeQuery(query, [id]);
		return subscriber[0] || null;
	} catch (error) {
		throw new Error(`Error finding subscriber: ${error.message}`);
	}
};

/**
 * Find subscriber by email
 * @param {string} email - Subscriber email
 * @returns {Promise<Object|null>} Subscriber object or null if not found
 */
export const findByEmail = async (email) => {
	const query = "SELECT id, email, preferred_language, status, subscription_date, updated_at FROM newsletter_subscribers WHERE email = ?";
	try {
		const subscriber = await dbPool.executeQuery(query, [email]);
		return subscriber[0] || null;
	} catch (error) {
		throw new Error(`Error finding subscriber: ${error.message}`);
	}
};

/**
 * Create new subscriber
 * @param {Object} subscriberData - Subscriber data
 * @param {string} subscriberData.email - Email address
 * @param {string} subscriberData.preferred_language - Preferred language (default: 'es')
 * @returns {Promise<number>} Created subscriber ID
 */
export const create = async ({ email, preferred_language = "es" }) => {
	// Check if email already exists
	const existingSubscriber = await findByEmail(email);
	if (existingSubscriber) {
		if (existingSubscriber.status === "inactive") {
			// Reactivate subscriber
			await update(existingSubscriber.id, { status: "active" });
			return existingSubscriber.id;
		}
		throw new Error("Email already subscribed");
	}

	const query = "INSERT INTO newsletter_subscribers (email, preferred_language) VALUES (?, ?)";
	try {
		const result = await dbPool.executeQuery(query, [email, preferred_language]);
		return result.insertId;
	} catch (error) {
		if (error.code === "ER_DUP_ENTRY") {
			throw new Error("Email already subscribed");
		}
		throw new Error(`Error creating subscriber: ${error.message}`);
	}
};

/**
 * Update subscriber data
 * @param {number} id - Subscriber ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<boolean>} True if updated, false otherwise
 */
export const update = async (id, updateData) => {
	const allowedFields = ["email", "preferred_language", "status"];
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
	const query = `UPDATE newsletter_subscribers SET ${updates.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;

	try {
		const result = await dbPool.executeQuery(query, values);
		return result.affectedRows > 0;
	} catch (error) {
		if (error.code === "ER_DUP_ENTRY") {
			throw new Error("Email already exists");
		}
		throw new Error(`Error updating subscriber: ${error.message}`);
	}
};

/**
 * Unsubscribe subscriber (set status to inactive)
 * @param {string} email - Subscriber email
 * @returns {Promise<boolean>} True if unsubscribed, false otherwise
 */
export const unsubscribe = async (email) => {
	const query = "UPDATE newsletter_subscribers SET status = 'inactive', updated_at = CURRENT_TIMESTAMP WHERE email = ?";
	try {
		const result = await dbPool.executeQuery(query, [email]);
		return result.affectedRows > 0;
	} catch (error) {
		throw new Error(`Error unsubscribing: ${error.message}`);
	}
};

/**
 * Remove subscriber
 * @param {number} id - Subscriber ID
 * @returns {Promise<boolean>} True if removed, false otherwise
 */
export const remove = async (id) => {
	const query = "DELETE FROM newsletter_subscribers WHERE id = ?";
	try {
		const result = await dbPool.executeQuery(query, [id]);
		return result.affectedRows > 0;
	} catch (error) {
		throw new Error(`Error deleting subscriber: ${error.message}`);
	}
};

/**
 * Find subscribers by multiple criteria
 * @param {Object} filters - Search filters
 * @param {string} filters.status - Filter by status
 * @param {string} filters.preferred_language - Filter by preferred language
 * @param {string} filters.search - Search in email
 * @param {number} filters.limit - Results limit
 * @param {number} filters.offset - Results offset
 * @param {string} filters.sortField - Field to sort by
 * @param {string} filters.sortOrder - Sort order (ASC or DESC)
 * @returns {Promise<Array>} Array of subscribers
 */
export const findByFilters = async ({
	status,
	preferred_language,
	search,
	limit = 10,
	offset = 0,
	sortField = "subscription_date",
	sortOrder = "DESC",
}) => {
	let query = "SELECT id, email, preferred_language, status, subscription_date, updated_at FROM newsletter_subscribers WHERE 1=1";
	const values = [];

	if (status) {
		query += " AND status = ?";
		values.push(status);
	}

	if (preferred_language) {
		query += " AND preferred_language = ?";
		values.push(preferred_language);
	}

	if (search) {
		query += " AND email LIKE ?";
		values.push(`%${search}%`);
	}

	// Validate sort field to prevent SQL injection
	const allowedSortFields = ["id", "email", "preferred_language", "status", "subscription_date", "updated_at"];
	const validSortField = allowedSortFields.includes(sortField) ? sortField : "subscription_date";

	// Validate sort order
	const validSortOrder = ["ASC", "DESC"].includes(sortOrder) ? sortOrder : "DESC";

	query += ` ORDER BY ${validSortField} ${validSortOrder} LIMIT ? OFFSET ?`;
	values.push(parseInt(limit), parseInt(offset));

	try {
		return await dbPool.executeQuery(query, values);
	} catch (error) {
		throw new Error(`Error searching subscribers: ${error.message}`);
	}
};

/**
 * Count total subscribers matching filters (for pagination)
 * @param {Object} filters - Search filters (same as findByFilters but without limit/offset)
 * @returns {Promise<number>} Total count of matching subscribers
 */
export const countByFilters = async ({ status, preferred_language, search }) => {
	let query = "SELECT COUNT(*) as total FROM newsletter_subscribers WHERE 1=1";
	const values = [];

	if (status) {
		query += " AND status = ?";
		values.push(status);
	}

	if (preferred_language) {
		query += " AND preferred_language = ?";
		values.push(preferred_language);
	}

	if (search) {
		query += " AND email LIKE ?";
		values.push(`%${search}%`);
	}

	try {
		const result = await dbPool.executeQuery(query, values);
		return result[0].total;
	} catch (error) {
		throw new Error(`Error counting subscribers: ${error.message}`);
	}
};

/**
 * Get active subscribers by language
 * @param {string} language - Language code
 * @returns {Promise<Array>} Array of active subscribers
 */
export const getActiveByLanguage = async (language) => {
	const query = "SELECT id, email, preferred_language FROM newsletter_subscribers WHERE status = 'active' AND preferred_language = ?";
	try {
		return await dbPool.executeQuery(query, [language]);
	} catch (error) {
		throw new Error(`Error getting active subscribers: ${error.message}`);
	}
};

/**
 * Get all active subscribers
 * @returns {Promise<Array>} Array of active subscribers
 */
export const getAllActive = async () => {
	const query = "SELECT id, email, preferred_language FROM newsletter_subscribers WHERE status = 'active'";
	try {
		return await dbPool.executeQuery(query);
	} catch (error) {
		throw new Error(`Error getting active subscribers: ${error.message}`);
	}
};

export default {
	findById,
	findByEmail,
	create,
	update,
	unsubscribe,
	remove,
	findByFilters,
	countByFilters,
	getActiveByLanguage,
	getAllActive,
};

