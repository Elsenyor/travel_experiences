import dbPool from "../utils/database.pool.js";

/**
 * Find send by ID
 * @param {number} id - Send ID
 * @returns {Promise<Object|null>} Send object or null if not found
 */
export const findById = async (id) => {
	const query = `
		SELECT ns.id, ns.campaign_id, ns.subscriber_id, ns.status, ns.sent_date, ns.created_at,
		       nc.subject as campaign_subject, nc.language as campaign_language,
		       nsub.email as subscriber_email, nsub.preferred_language
		FROM newsletter_sends ns
		JOIN newsletter_campaigns nc ON ns.campaign_id = nc.id
		JOIN newsletter_subscribers nsub ON ns.subscriber_id = nsub.id
		WHERE ns.id = ?
	`;
	try {
		const send = await dbPool.executeQuery(query, [id]);
		return send[0] || null;
	} catch (error) {
		throw new Error(`Error finding send: ${error.message}`);
	}
};

/**
 * Create new send record
 * @param {Object} sendData - Send data
 * @param {number} sendData.campaign_id - Campaign ID
 * @param {number} sendData.subscriber_id - Subscriber ID
 * @returns {Promise<number>} Created send ID
 */
export const create = async ({ campaign_id, subscriber_id }) => {
	const query = "INSERT INTO newsletter_sends (campaign_id, subscriber_id) VALUES (?, ?)";
	try {
		const result = await dbPool.executeQuery(query, [campaign_id, subscriber_id]);
		return result.insertId;
	} catch (error) {
		throw new Error(`Error creating send: ${error.message}`);
	}
};

/**
 * Update send status
 * @param {number} id - Send ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<boolean>} True if updated, false otherwise
 */
export const update = async (id, updateData) => {
	const allowedFields = ["status", "sent_date"];
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
	const query = `UPDATE newsletter_sends SET ${updates.join(", ")} WHERE id = ?`;

	try {
		const result = await dbPool.executeQuery(query, values);
		return result.affectedRows > 0;
	} catch (error) {
		throw new Error(`Error updating send: ${error.message}`);
	}
};

/**
 * Mark send as sent
 * @param {number} id - Send ID
 * @returns {Promise<boolean>} True if updated, false otherwise
 */
export const markAsSent = async (id) => {
	const query = "UPDATE newsletter_sends SET status = 'sent', sent_date = CURRENT_TIMESTAMP WHERE id = ?";
	try {
		const result = await dbPool.executeQuery(query, [id]);
		return result.affectedRows > 0;
	} catch (error) {
		throw new Error(`Error marking send as sent: ${error.message}`);
	}
};

/**
 * Mark send as failed
 * @param {number} id - Send ID
 * @returns {Promise<boolean>} True if updated, false otherwise
 */
export const markAsFailed = async (id) => {
	const query = "UPDATE newsletter_sends SET status = 'failed' WHERE id = ?";
	try {
		const result = await dbPool.executeQuery(query, [id]);
		return result.affectedRows > 0;
	} catch (error) {
		throw new Error(`Error marking send as failed: ${error.message}`);
	}
};

/**
 * Remove send record
 * @param {number} id - Send ID
 * @returns {Promise<boolean>} True if removed, false otherwise
 */
export const remove = async (id) => {
	const query = "DELETE FROM newsletter_sends WHERE id = ?";
	try {
		const result = await dbPool.executeQuery(query, [id]);
		return result.affectedRows > 0;
	} catch (error) {
		throw new Error(`Error deleting send: ${error.message}`);
	}
};

/**
 * Find sends by campaign ID
 * @param {number} campaignId - Campaign ID
 * @returns {Promise<Array>} Array of sends for the campaign
 */
export const findByCampaignId = async (campaignId) => {
	const query = `
		SELECT ns.id, ns.campaign_id, ns.subscriber_id, ns.status, ns.sent_date, ns.created_at,
		       nsub.email as subscriber_email, nsub.preferred_language
		FROM newsletter_sends ns
		JOIN newsletter_subscribers nsub ON ns.subscriber_id = nsub.id
		WHERE ns.campaign_id = ?
		ORDER BY ns.created_at DESC
	`;
	try {
		return await dbPool.executeQuery(query, [campaignId]);
	} catch (error) {
		throw new Error(`Error finding sends by campaign: ${error.message}`);
	}
};

/**
 * Find sends by subscriber ID
 * @param {number} subscriberId - Subscriber ID
 * @returns {Promise<Array>} Array of sends for the subscriber
 */
export const findBySubscriberId = async (subscriberId) => {
	const query = `
		SELECT ns.id, ns.campaign_id, ns.subscriber_id, ns.status, ns.sent_date, ns.created_at,
		       nc.subject as campaign_subject, nc.language as campaign_language
		FROM newsletter_sends ns
		JOIN newsletter_campaigns nc ON ns.campaign_id = nc.id
		WHERE ns.subscriber_id = ?
		ORDER BY ns.created_at DESC
	`;
	try {
		return await dbPool.executeQuery(query, [subscriberId]);
	} catch (error) {
		throw new Error(`Error finding sends by subscriber: ${error.message}`);
	}
};

/**
 * Find sends by multiple criteria
 * @param {Object} filters - Search filters
 * @param {number} filters.campaign_id - Filter by campaign ID
 * @param {number} filters.subscriber_id - Filter by subscriber ID
 * @param {string} filters.status - Filter by status
 * @param {string} filters.language - Filter by campaign language
 * @param {number} filters.limit - Results limit
 * @param {number} filters.offset - Results offset
 * @param {string} filters.sortField - Field to sort by
 * @param {string} filters.sortOrder - Sort order (ASC or DESC)
 * @returns {Promise<Array>} Array of sends
 */
export const findByFilters = async ({
	campaign_id,
	subscriber_id,
	status,
	language,
	limit = 10,
	offset = 0,
	sortField = "created_at",
	sortOrder = "DESC",
}) => {
	let query = `
		SELECT ns.id, ns.campaign_id, ns.subscriber_id, ns.status, ns.sent_date, ns.created_at,
		       nc.subject as campaign_subject, nc.language as campaign_language,
		       nsub.email as subscriber_email, nsub.preferred_language
		FROM newsletter_sends ns
		JOIN newsletter_campaigns nc ON ns.campaign_id = nc.id
		JOIN newsletter_subscribers nsub ON ns.subscriber_id = nsub.id
		WHERE 1=1
	`;
	const values = [];

	if (campaign_id) {
		query += " AND ns.campaign_id = ?";
		values.push(campaign_id);
	}

	if (subscriber_id) {
		query += " AND ns.subscriber_id = ?";
		values.push(subscriber_id);
	}

	if (status) {
		query += " AND ns.status = ?";
		values.push(status);
	}

	if (language) {
		query += " AND nc.language = ?";
		values.push(language);
	}

	// Validate sort field to prevent SQL injection
	const allowedSortFields = ["id", "campaign_id", "subscriber_id", "status", "sent_date", "created_at"];
	const validSortField = allowedSortFields.includes(sortField) ? sortField : "created_at";

	// Validate sort order
	const validSortOrder = ["ASC", "DESC"].includes(sortOrder) ? sortOrder : "DESC";

	query += ` ORDER BY ns.${validSortField} ${validSortOrder} LIMIT ? OFFSET ?`;
	values.push(parseInt(limit), parseInt(offset));

	try {
		return await dbPool.executeQuery(query, values);
	} catch (error) {
		throw new Error(`Error searching sends: ${error.message}`);
	}
};

/**
 * Count total sends matching filters (for pagination)
 * @param {Object} filters - Search filters (same as findByFilters but without limit/offset)
 * @returns {Promise<number>} Total count of matching sends
 */
export const countByFilters = async ({ campaign_id, subscriber_id, status, language }) => {
	let query = `
		SELECT COUNT(*) as total
		FROM newsletter_sends ns
		JOIN newsletter_campaigns nc ON ns.campaign_id = nc.id
		JOIN newsletter_subscribers nsub ON ns.subscriber_id = nsub.id
		WHERE 1=1
	`;
	const values = [];

	if (campaign_id) {
		query += " AND ns.campaign_id = ?";
		values.push(campaign_id);
	}

	if (subscriber_id) {
		query += " AND ns.subscriber_id = ?";
		values.push(subscriber_id);
	}

	if (status) {
		query += " AND ns.status = ?";
		values.push(status);
	}

	if (language) {
		query += " AND nc.language = ?";
		values.push(language);
	}

	try {
		const result = await dbPool.executeQuery(query, values);
		return result[0].total;
	} catch (error) {
		throw new Error(`Error counting sends: ${error.message}`);
	}
};

/**
 * Get send statistics for a campaign
 * @param {number} campaignId - Campaign ID
 * @returns {Promise<Object>} Send statistics
 */
export const getCampaignStats = async (campaignId) => {
	const query = `
		SELECT 
			COUNT(*) as total_sends,
			SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as successful_sends,
			SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_sends,
			SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_sends
		FROM newsletter_sends
		WHERE campaign_id = ?
	`;
	try {
		const result = await dbPool.executeQuery(query, [campaignId]);
		return (
			result[0] || {
				total_sends: 0,
				successful_sends: 0,
				failed_sends: 0,
				pending_sends: 0,
			}
		);
	} catch (error) {
		throw new Error(`Error getting campaign stats: ${error.message}`);
	}
};

/**
 * Create multiple send records for a campaign
 * @param {number} campaignId - Campaign ID
 * @param {Array<number>} subscriberIds - Array of subscriber IDs
 * @returns {Promise<Array<number>>} Array of created send IDs
 */
export const createBulk = async (campaignId, subscriberIds) => {
	if (!subscriberIds || subscriberIds.length === 0) {
		return [];
	}

	const query = "INSERT INTO newsletter_sends (campaign_id, subscriber_id) VALUES (?, ?)";
	const sendIds = [];

	try {
		for (const subscriberId of subscriberIds) {
			const result = await dbPool.executeQuery(query, [campaignId, subscriberId]);
			sendIds.push(result.insertId);
		}
		return sendIds;
	} catch (error) {
		throw new Error(`Error creating bulk sends: ${error.message}`);
	}
};

export default {
	findById,
	create,
	update,
	markAsSent,
	markAsFailed,
	remove,
	findByCampaignId,
	findBySubscriberId,
	findByFilters,
	countByFilters,
	getCampaignStats,
	createBulk,
};
