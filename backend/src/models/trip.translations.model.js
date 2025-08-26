import dbPool from "../utils/database.pool.js";

/**
 * Find all translations for a trip
 * @param {number} tripId - Trip ID
 * @returns {Promise<Array>} Array of translations
 */
export const findByTripId = async (tripId) => {
	const query = "SELECT id, trip_id, language, title, description, itinerary, created_at, updated_at FROM trip_translations WHERE trip_id = ?";
	try {
		return await dbPool.executeQuery(query, [tripId]);
	} catch (error) {
		throw new Error(`Error finding trip translations: ${error.message}`);
	}
};

/**
 * Find translation by trip ID and language
 * @param {number} tripId - Trip ID
 * @param {string} language - Language code
 * @returns {Promise<Object|null>} Translation object or null if not found
 */
export const findByTripIdAndLanguage = async (tripId, language) => {
	const query =
		"SELECT id, trip_id, language, title, description, itinerary, created_at, updated_at FROM trip_translations WHERE trip_id = ? AND language = ?";
	try {
		const translation = await dbPool.executeQuery(query, [tripId, language]);
		return translation[0] || null;
	} catch (error) {
		throw new Error(`Error finding trip translation: ${error.message}`);
	}
};

/**
 * Create new translation for a trip
 * @param {Object} translationData - Translation data
 * @param {number} translationData.trip_id - Trip ID
 * @param {string} translationData.language - Language code
 * @param {string} translationData.title - Trip title
 * @param {string} translationData.description - Trip description
 * @param {string} translationData.itinerary - Trip itinerary
 * @returns {Promise<number>} Created translation ID
 */
export const create = async ({ trip_id, language, title, description, itinerary }) => {
	const query = "INSERT INTO trip_translations (trip_id, language, title, description, itinerary) VALUES (?, ?, ?, ?, ?)";
	try {
		const result = await dbPool.executeQuery(query, [trip_id, language, title, description, itinerary]);
		return result.insertId;
	} catch (error) {
		if (error.code === "ER_DUP_ENTRY") {
			throw new Error(`Translation for language ${language} already exists for this trip`);
		}
		throw new Error(`Error creating trip translation: ${error.message}`);
	}
};

/**
 * Update translation data
 * @param {number} id - Translation ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<boolean>} True if updated, false otherwise
 */
export const update = async (id, updateData) => {
	const allowedFields = ["title", "description", "itinerary"];
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
	const query = `UPDATE trip_translations SET ${updates.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;

	try {
		const result = await dbPool.executeQuery(query, values);
		return result.affectedRows > 0;
	} catch (error) {
		throw new Error(`Error updating trip translation: ${error.message}`);
	}
};

/**
 * Remove translation
 * @param {number} id - Translation ID
 * @returns {Promise<boolean>} True if removed, false otherwise
 */
export const remove = async (id) => {
	const query = "DELETE FROM trip_translations WHERE id = ?";
	try {
		const result = await dbPool.executeQuery(query, [id]);
		return result.affectedRows > 0;
	} catch (error) {
		throw new Error(`Error deleting trip translation: ${error.message}`);
	}
};

/**
 * Remove all translations for a trip
 * @param {number} tripId - Trip ID
 * @returns {Promise<boolean>} True if removed, false otherwise
 */
export const removeByTripId = async (tripId) => {
	const query = "DELETE FROM trip_translations WHERE trip_id = ?";
	try {
		const result = await dbPool.executeQuery(query, [tripId]);
		return result.affectedRows > 0;
	} catch (error) {
		throw new Error(`Error deleting trip translations: ${error.message}`);
	}
};

export default {
	findByTripId,
	findByTripIdAndLanguage,
	create,
	update,
	remove,
	removeByTripId,
};
