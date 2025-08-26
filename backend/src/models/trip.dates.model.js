import dbPool from "../utils/database.pool.js";

/**
 * Find all available dates for a trip
 * @param {number} tripId - Trip ID
 * @param {boolean} futureOnly - Only return future dates
 * @returns {Promise<Array>} Array of available dates
 */
export const findByTripId = async (tripId, futureOnly = true) => {
	let query = "SELECT id, trip_id, start_date, end_date, available_spots, created_at, updated_at FROM available_dates WHERE trip_id = ?";

	if (futureOnly) {
		query += " AND start_date >= CURDATE()";
	}

	query += " ORDER BY start_date ASC";

	try {
		return await dbPool.executeQuery(query, [tripId]);
	} catch (error) {
		throw new Error(`Error finding available dates: ${error.message}`);
	}
};

/**
 * Find available date by ID
 * @param {number} id - Available date ID
 * @returns {Promise<Object|null>} Available date object or null if not found
 */
export const findById = async (id) => {
	const query = "SELECT id, trip_id, start_date, end_date, available_spots, created_at, updated_at FROM available_dates WHERE id = ?";
	try {
		const date = await dbPool.executeQuery(query, [id]);
		return date[0] || null;
	} catch (error) {
		throw new Error(`Error finding available date: ${error.message}`);
	}
};

/**
 * Create new available date for a trip
 * @param {Object} dateData - Available date data
 * @param {number} dateData.trip_id - Trip ID
 * @param {string} dateData.start_date - Start date (YYYY-MM-DD)
 * @param {string} dateData.end_date - End date (YYYY-MM-DD)
 * @param {number} dateData.available_spots - Number of available spots
 * @returns {Promise<number>} Created available date ID
 */
export const create = async ({ trip_id, start_date, end_date, available_spots }) => {
	// Validate dates
	if (new Date(start_date) > new Date(end_date)) {
		throw new Error("Start date cannot be after end date");
	}

	const query = "INSERT INTO available_dates (trip_id, start_date, end_date, available_spots) VALUES (?, ?, ?, ?)";
	try {
		const result = await dbPool.executeQuery(query, [trip_id, start_date, end_date, available_spots]);
		return result.insertId;
	} catch (error) {
		throw new Error(`Error creating available date: ${error.message}`);
	}
};

/**
 * Update available date data
 * @param {number} id - Available date ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<boolean>} True if updated, false otherwise
 */
export const update = async (id, updateData) => {
	const allowedFields = ["start_date", "end_date", "available_spots"];
	const updates = [];
	const values = [];

	// Validate dates if both are present
	if (updateData.start_date && updateData.end_date) {
		if (new Date(updateData.start_date) > new Date(updateData.end_date)) {
			throw new Error("Start date cannot be after end date");
		}
	}

	Object.keys(updateData).forEach((key) => {
		if (allowedFields.includes(key)) {
			updates.push(`${key} = ?`);
			values.push(updateData[key]);
		}
	});

	if (updates.length === 0) return null;

	values.push(id);
	const query = `UPDATE available_dates SET ${updates.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;

	try {
		const result = await dbPool.executeQuery(query, values);
		return result.affectedRows > 0;
	} catch (error) {
		throw new Error(`Error updating available date: ${error.message}`);
	}
};

/**
 * Update available spots (decrease by booking count)
 * @param {number} id - Available date ID
 * @param {number} bookingCount - Number of spots to book
 * @returns {Promise<boolean>} True if updated, false otherwise
 */
export const updateAvailableSpots = async (id, bookingCount) => {
	// First check if enough spots are available
	const date = await findById(id);
	if (!date) {
		throw new Error("Available date not found");
	}

	if (date.available_spots < bookingCount) {
		throw new Error("Not enough available spots");
	}

	const query = "UPDATE available_dates SET available_spots = available_spots - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
	try {
		const result = await dbPool.executeQuery(query, [bookingCount, id]);
		return result.affectedRows > 0;
	} catch (error) {
		throw new Error(`Error updating available spots: ${error.message}`);
	}
};

/**
 * Remove available date
 * @param {number} id - Available date ID
 * @returns {Promise<boolean>} True if removed, false otherwise
 */
export const remove = async (id) => {
	const query = "DELETE FROM available_dates WHERE id = ?";
	try {
		const result = await dbPool.executeQuery(query, [id]);
		return result.affectedRows > 0;
	} catch (error) {
		throw new Error(`Error deleting available date: ${error.message}`);
	}
};

/**
 * Remove all available dates for a trip
 * @param {number} tripId - Trip ID
 * @returns {Promise<boolean>} True if removed, false otherwise
 */
export const removeByTripId = async (tripId) => {
	const query = "DELETE FROM available_dates WHERE trip_id = ?";
	try {
		const result = await dbPool.executeQuery(query, [tripId]);
		return result.affectedRows > 0;
	} catch (error) {
		throw new Error(`Error deleting available dates: ${error.message}`);
	}
};

export default {
	findByTripId,
	findById,
	create,
	update,
	updateAvailableSpots,
	remove,
	removeByTripId,
};
