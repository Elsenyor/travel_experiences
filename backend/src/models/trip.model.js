import dbPool from "../utils/database.pool.js";
import { generateSlug, generateUniqueSlug, getSlugFromTitle } from "../utils/slug.utils.js";

/**
 * Find trip by ID with translations in specified language
 * @param {number} id - Trip ID
 * @param {string} language - Language code (default: 'es')
 * @returns {Promise<Object|null>} Trip object with translations or null if not found
 */
export const findById = async (id, language = "es") => {
	const query = `
		SELECT 
			t.id, t.destination, t.trip_type, t.price, t.featured,
			tt.title, tt.description, tt.itinerary,
			t.created_at, t.updated_at
		FROM trips t
		LEFT JOIN trip_translations tt ON t.id = tt.trip_id AND tt.language = ?
		WHERE t.id = ?
	`;
	try {
		const trip = await dbPool.executeQuery(query, [language, id]);
		return trip[0] || null;
	} catch (error) {
		throw new Error(`Error finding trip: ${error.message}`);
	}
};

/**
 * Get trip images by trip ID
 * @param {number} tripId - Trip ID
 * @returns {Promise<Array>} Array of trip images
 */
export const getTripImages = async (tripId) => {
	const query = "SELECT id, url, description FROM trip_images WHERE trip_id = ?";
	try {
		return await dbPool.executeQuery(query, [tripId]);
	} catch (error) {
		throw new Error(`Error getting trip images: ${error.message}`);
	}
};

/**
 * Get available dates for a trip
 * @param {number} tripId - Trip ID
 * @returns {Promise<Array>} Array of available dates
 */
export const getAvailableDates = async (tripId) => {
	const query =
		"SELECT id, start_date, end_date, available_spots FROM available_dates WHERE trip_id = ? AND start_date >= CURDATE() ORDER BY start_date";
	try {
		return await dbPool.executeQuery(query, [tripId]);
	} catch (error) {
		throw new Error(`Error getting available dates: ${error.message}`);
	}
};

/**
 * Find trip by slug
 * @param {string} slug - Trip slug
 * @returns {Promise<Object|null>} Trip object or null
 */
export const findBySlug = async (slug) => {
	const query = "SELECT id, slug FROM trips WHERE slug = ?";
	try {
		const trips = await dbPool.executeQuery(query, [slug]);
		return trips[0] || null;
	} catch (error) {
		throw new Error(`Error finding trip by slug: ${error.message}`);
	}
};

/**
 * Create new trip with translations using transaction to ensure integrity
 * @param {Object} tripData - Trip data
 * @param {string} tripData.destination - Destination city/location
 * @param {string} tripData.trip_type - Type of trip (cultural, adventure, etc)
 * @param {number} tripData.price - Trip price per person
 * @param {boolean} tripData.featured - Whether to show in featured section
 * @param {number} tripData.created_by - ID of user creating the trip
 * @param {string} tripData.slug - Optional custom slug
 * @param {Array} tripData.translations - Array of translation objects
 * @param {string} tripData.translations[].language - Language code
 * @param {string} tripData.translations[].title - Trip title
 * @param {string} tripData.translations[].description - Trip description
 * @param {string} tripData.translations[].itinerary - Trip itinerary
 * @returns {Promise<number>} Created trip ID
 */
export const create = async ({ destination, trip_type, price, featured = false, created_by, slug, translations }) => {
	// Validate required translations
	if (!translations || !translations.length) {
		throw new Error("At least one translation is required");
	}

	// Validate translation data
	translations.forEach((translation) => {
		if (!translation.language || !translation.title || !translation.description || !translation.itinerary) {
			throw new Error("Incomplete translation data");
		}
	});

	// Generate slug from first translation title if not provided
	const firstTranslation = translations[0];
	let finalSlug = getSlugFromTitle(firstTranslation.title, slug);

	// Ensure slug is unique
	finalSlug = await generateUniqueSlug(finalSlug, findBySlug);

	// Create trip with slug
	const query = "INSERT INTO trips (destination, trip_type, price, featured, created_by, slug) VALUES (?, ?, ?, ?, ?, ?)";

	try {
		const result = await dbPool.executeQuery(query, [destination, trip_type, price, featured, created_by, finalSlug]);
		const tripId = result.insertId;

		// Add translations after getting trip ID
		for (const translation of translations) {
			await dbPool.executeQuery("INSERT INTO trip_translations (trip_id, language, title, description, itinerary) VALUES (?, ?, ?, ?, ?)", [
				tripId,
				translation.language,
				translation.title,
				translation.description,
				translation.itinerary,
			]);
		}

		return tripId;
	} catch (error) {
		throw new Error(`Error creating trip: ${error.message}`);
	}
};

/**
 * Add image to trip
 * @param {number} tripId - Trip ID
 * @param {string} url - Image URL
 * @param {string} description - Image description
 * @returns {Promise<number>} Created image ID
 */
export const addImage = async (tripId, url, description = null) => {
	const query = "INSERT INTO trip_images (trip_id, url, description) VALUES (?, ?, ?)";
	try {
		const result = await dbPool.executeQuery(query, [tripId, url, description]);
		return result.insertId;
	} catch (error) {
		throw new Error(`Error adding trip image: ${error.message}`);
	}
};

/**
 * Add available date to trip
 * @param {number} tripId - Trip ID
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @param {number} availableSpots - Number of available spots
 * @returns {Promise<number>} Created date ID
 */
export const addAvailableDate = async (tripId, startDate, endDate, availableSpots) => {
	const query = "INSERT INTO available_dates (trip_id, start_date, end_date, available_spots) VALUES (?, ?, ?, ?)";
	try {
		const result = await dbPool.executeQuery(query, [tripId, startDate, endDate, availableSpots]);
		return result.insertId;
	} catch (error) {
		throw new Error(`Error adding available date: ${error.message}`);
	}
};

/**
 * Update trip data
 * @param {number} id - Trip ID
 * @param {Object} updateData - Data to update
 * @param {string} updateData.slug - Optional slug (will be validated and made unique)
 * @returns {Promise<boolean>} True if updated, false otherwise
 */
export const update = async (id, updateData) => {
	const allowedFields = ["destination", "trip_type", "price", "featured", "slug"];
	const updates = [];
	const values = [];

	// Handle slug separately to ensure uniqueness
	if (updateData.slug !== undefined) {
		let newSlug = updateData.slug;

		// If slug is provided, sanitize it
		if (newSlug) {
			newSlug = generateSlug(newSlug);
			// Ensure uniqueness (excluding current trip)
			newSlug = await generateUniqueSlug(newSlug, findBySlug, id);
		}

		updates.push("slug = ?");
		values.push(newSlug);
	}

	// Handle other fields
	Object.keys(updateData).forEach((key) => {
		if (allowedFields.includes(key) && key !== "slug") {
			updates.push(`${key} = ?`);
			values.push(updateData[key]);
		}
	});

	if (updates.length === 0) return null;

	values.push(id);
	const query = `UPDATE trips SET ${updates.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;

	try {
		const result = await dbPool.executeQuery(query, values);
		return result.affectedRows > 0;
	} catch (error) {
		throw new Error(`Error updating trip: ${error.message}`);
	}
};

/**
 * Update trip translation
 * @param {number} tripId - Trip ID
 * @param {string} language - Language code
 * @param {Object} translationData - Translation data to update
 * @returns {Promise<boolean>} True if updated, false otherwise
 */
export const updateTranslation = async (tripId, language, translationData) => {
	const allowedFields = ["title", "description", "itinerary"];
	const updates = [];
	const values = [];

	Object.keys(translationData).forEach((key) => {
		if (allowedFields.includes(key)) {
			updates.push(`${key} = ?`);
			values.push(translationData[key]);
		}
	});

	if (updates.length === 0) return null;

	values.push(tripId, language);
	const query = `UPDATE trip_translations SET ${updates.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE trip_id = ? AND language = ?`;

	try {
		const result = await dbPool.executeQuery(query, values);
		return result.affectedRows > 0;
	} catch (error) {
		throw new Error(`Error updating trip translation: ${error.message}`);
	}
};

/**
 * Remove trip and all related data (translations, images, dates)
 * @param {number} id - Trip ID
 * @returns {Promise<boolean>} True if removed, false otherwise
 */
export const remove = async (id) => {
	const query = "DELETE FROM trips WHERE id = ?";
	try {
		const result = await dbPool.executeQuery(query, [id]);
		return result.affectedRows > 0;
	} catch (error) {
		throw new Error(`Error deleting trip: ${error.message}`);
	}
};

/**
 * Find trips by multiple criteria
 * @param {Object} filters - Search filters
 * @param {string} filters.language - Language for translations (default: 'es')
 * @param {string} filters.destination - Filter by destination
 * @param {string} filters.trip_type - Filter by trip type
 * @param {number} filters.min_price - Minimum price
 * @param {number} filters.max_price - Maximum price
 * @param {boolean} filters.featured - Filter by featured status
 * @param {string} filters.search - Search in title and description
 * @param {number} filters.limit - Results limit
 * @param {number} filters.offset - Results offset
 * @returns {Promise<Array>} Array of trips with translations
 */
export const findByFilters = async ({ language = "es", destination, trip_type, min_price, max_price, featured, search, limit = 10, offset = 0 }) => {
	let query = `
		SELECT 
			t.id, t.destination, t.trip_type, t.price, t.featured,
			tt.title, tt.description,
			t.created_at, t.updated_at
		FROM trips t
		LEFT JOIN trip_translations tt ON t.id = tt.trip_id AND tt.language = ?
		WHERE 1=1
	`;

	const values = [language];

	if (destination) {
		query += " AND t.destination LIKE ?";
		values.push(`%${destination}%`);
	}

	if (trip_type) {
		query += " AND t.trip_type = ?";
		values.push(trip_type);
	}

	if (min_price !== undefined) {
		query += " AND t.price >= ?";
		values.push(min_price);
	}

	if (max_price !== undefined) {
		query += " AND t.price <= ?";
		values.push(max_price);
	}

	if (featured !== undefined) {
		query += " AND t.featured = ?";
		values.push(featured);
	}

	if (search) {
		query += " AND (tt.title LIKE ? OR tt.description LIKE ?)";
		values.push(`%${search}%`, `%${search}%`);
	}

	query += " ORDER BY t.created_at DESC LIMIT ? OFFSET ?";
	values.push(parseInt(limit), parseInt(offset));

	try {
		return await dbPool.executeQuery(query, values);
	} catch (error) {
		throw new Error(`Error searching trips: ${error.message}`);
	}
};

/**
 * Count total trips matching filters (for pagination)
 * @param {Object} filters - Search filters (same as findByFilters but without limit/offset)
 * @returns {Promise<number>} Total count of matching trips
 */
export const countByFilters = async ({ language = "es", destination, trip_type, min_price, max_price, featured, search }) => {
	let query = `
		SELECT COUNT(*) as total
		FROM trips t
		LEFT JOIN trip_translations tt ON t.id = tt.trip_id AND tt.language = ?
		WHERE 1=1
	`;

	const values = [language];

	if (destination) {
		query += " AND t.destination LIKE ?";
		values.push(`%${destination}%`);
	}

	if (trip_type) {
		query += " AND t.trip_type = ?";
		values.push(trip_type);
	}

	if (min_price !== undefined) {
		query += " AND t.price >= ?";
		values.push(min_price);
	}

	if (max_price !== undefined) {
		query += " AND t.price <= ?";
		values.push(max_price);
	}

	if (featured !== undefined) {
		query += " AND t.featured = ?";
		values.push(featured);
	}

	if (search) {
		query += " AND (tt.title LIKE ? OR tt.description LIKE ?)";
		values.push(`%${search}%`, `%${search}%`);
	}

	try {
		const result = await dbPool.executeQuery(query, values);
		return result[0].total;
	} catch (error) {
		throw new Error(`Error counting trips: ${error.message}`);
	}
};

export default {
	findById,
	findBySlug,
	getTripImages,
	getAvailableDates,
	create,
	addImage,
	addAvailableDate,
	update,
	updateTranslation,
	remove,
	findByFilters,
	countByFilters,
};
