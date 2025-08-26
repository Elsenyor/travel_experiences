import dbPool from "../utils/database.pool.js";

/**
 * Find all images for a trip
 * @param {number} tripId - Trip ID
 * @returns {Promise<Array>} Array of images
 */
export const findByTripId = async (tripId) => {
	const query = "SELECT id, trip_id, url, description, created_at FROM trip_images WHERE trip_id = ?";
	try {
		return await dbPool.executeQuery(query, [tripId]);
	} catch (error) {
		throw new Error(`Error finding trip images: ${error.message}`);
	}
};

/**
 * Find image by ID
 * @param {number} id - Image ID
 * @returns {Promise<Object|null>} Image object or null if not found
 */
export const findById = async (id) => {
	const query = "SELECT id, trip_id, url, description, created_at FROM trip_images WHERE id = ?";
	try {
		const image = await dbPool.executeQuery(query, [id]);
		return image[0] || null;
	} catch (error) {
		throw new Error(`Error finding trip image: ${error.message}`);
	}
};

/**
 * Create new image for a trip
 * @param {Object} imageData - Image data
 * @param {number} imageData.trip_id - Trip ID
 * @param {string} imageData.url - Image URL
 * @param {string} imageData.description - Image description
 * @returns {Promise<number>} Created image ID
 */
export const create = async ({ trip_id, url, description = null }) => {
	const query = "INSERT INTO trip_images (trip_id, url, description) VALUES (?, ?, ?)";
	try {
		const result = await dbPool.executeQuery(query, [trip_id, url, description]);
		return result.insertId;
	} catch (error) {
		throw new Error(`Error creating trip image: ${error.message}`);
	}
};

/**
 * Update image data
 * @param {number} id - Image ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<boolean>} True if updated, false otherwise
 */
export const update = async (id, updateData) => {
	const allowedFields = ["url", "description"];
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
	const query = `UPDATE trip_images SET ${updates.join(", ")} WHERE id = ?`;

	try {
		const result = await dbPool.executeQuery(query, values);
		return result.affectedRows > 0;
	} catch (error) {
		throw new Error(`Error updating trip image: ${error.message}`);
	}
};

/**
 * Remove image
 * @param {number} id - Image ID
 * @returns {Promise<boolean>} True if removed, false otherwise
 */
export const remove = async (id) => {
	const query = "DELETE FROM trip_images WHERE id = ?";
	try {
		const result = await dbPool.executeQuery(query, [id]);
		return result.affectedRows > 0;
	} catch (error) {
		throw new Error(`Error deleting trip image: ${error.message}`);
	}
};

/**
 * Remove all images for a trip
 * @param {number} tripId - Trip ID
 * @returns {Promise<boolean>} True if removed, false otherwise
 */
export const removeByTripId = async (tripId) => {
	const query = "DELETE FROM trip_images WHERE trip_id = ?";
	try {
		const result = await dbPool.executeQuery(query, [tripId]);
		return result.affectedRows > 0;
	} catch (error) {
		throw new Error(`Error deleting trip images: ${error.message}`);
	}
};

export default {
	findByTripId,
	findById,
	create,
	update,
	remove,
	removeByTripId,
};
