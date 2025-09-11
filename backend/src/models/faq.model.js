import dbPool from "../utils/database.pool.js";
import { generateUUID } from "../utils/uuid.service.js";

/**
 * Find FAQ by ID with translations in specified language
 * @param {string} id - FAQ ID
 * @param {string} language - Language code (default: 'es')
 * @returns {Promise<Object|null>} FAQ object with translations or null if not found
 */
export const findById = async (id, language = "es") => {
	try {
		const query = `
      SELECT 
        f.id, ft.question, ft.answer, ft.language,
        f.created_at, f.updated_at
      FROM faqs f
      LEFT JOIN faq_translations ft ON f.id = ft.faq_id AND ft.language = ?
      WHERE f.id = ?
    `;
		const faqs = await dbPool.executeQuery(query, [language, id]);
		return faqs[0] || null;
	} catch (error) {
		throw new Error(`Error finding FAQ: ${error.message}`);
	}
};

/**
 * Find all FAQs with translations in specified language
 * @param {Object} options - Query options
 * @param {string} options.language - Language code (default: 'es')
 * @param {string} options.search - Search in question or answer
 * @param {number} options.limit - Results limit
 * @param {number} options.offset - Results offset
 * @returns {Promise<Array>} Array of FAQ objects with translations
 */
export const findAll = async ({ language = "es", search, limit = 10, offset = 0 } = {}) => {
	try {
		let query = `
      SELECT 
        f.id, ft.question, ft.answer, ft.language,
        f.created_at, f.updated_at
      FROM faqs f
      LEFT JOIN faq_translations ft ON f.id = ft.faq_id AND ft.language = ?
      WHERE 1=1
    `;

		const values = [language];

		if (search) {
			query += " AND (ft.question LIKE ? OR ft.answer LIKE ?)";
			values.push(`%${search}%`, `%${search}%`);
		}

		query += " ORDER BY f.created_at DESC LIMIT ? OFFSET ?";
		values.push(parseInt(limit), parseInt(offset));

		return await dbPool.executeQuery(query, values);
	} catch (error) {
		throw new Error(`Error finding FAQs: ${error.message}`);
	}
};

/**
 * Count all FAQs
 * @param {Object} options - Query options
 * @param {string} options.language - Language code (default: 'es')
 * @param {string} options.search - Search in question or answer
 * @returns {Promise<number>} Count of FAQs
 */
export const countAll = async ({ language = "es", search } = {}) => {
	try {
		let query = `
      SELECT COUNT(DISTINCT f.id) as count
      FROM faqs f
      LEFT JOIN faq_translations ft ON f.id = ft.faq_id AND ft.language = ?
      WHERE 1=1
    `;

		const values = [language];

		if (search) {
			query += " AND (ft.question LIKE ? OR ft.answer LIKE ?)";
			values.push(`%${search}%`, `%${search}%`);
		}

		const result = await dbPool.executeQuery(query, values);
		return result[0].count;
	} catch (error) {
		throw new Error(`Error counting FAQs: ${error.message}`);
	}
};

/**
 * Create new FAQ with translations
 * @param {Object} data - FAQ data
 * @param {Array} data.translations - Array of translation objects
 * @param {string} data.translations[].language - Language code
 * @param {string} data.translations[].question - Question text
 * @param {string} data.translations[].answer - Answer text
 * @returns {Promise<string>} Created FAQ ID
 */
export const create = async ({ translations }) => {
	// Validate required translations
	if (!translations || !translations.length) {
		throw new Error("At least one translation is required");
	}

	try {
		// Create FAQ entry
		const id = generateUUID();
		await dbPool.executeQuery("INSERT INTO faqs (id) VALUES (?)", [id]);

		// Add translations
		for (const translation of translations) {
			if (!translation.language || !translation.question || !translation.answer) {
				throw new Error("Incomplete translation data");
			}

			await dbPool.executeQuery("INSERT INTO faq_translations (faq_id, language, question, answer) VALUES (?, ?, ?, ?)", [
				id,
				translation.language,
				translation.question,
				translation.answer,
			]);
		}

		return id;
	} catch (error) {
		throw new Error(`Error creating FAQ: ${error.message}`);
	}
};

/**
 * Update FAQ translation
 * @param {string} id - FAQ ID
 * @param {Object} translation - Translation data
 * @param {string} translation.language - Language code
 * @param {string} translation.question - Question text
 * @param {string} translation.answer - Answer text
 * @returns {Promise<void>}
 */
export const updateTranslation = async (id, { language, question, answer }) => {
	try {
		// Check if translation exists
		const existingTranslation = await dbPool.executeQuery("SELECT 1 FROM faq_translations WHERE faq_id = ? AND language = ?", [id, language]);

		if (existingTranslation.length > 0) {
			// Update existing translation
			await dbPool.executeQuery("UPDATE faq_translations SET question = ?, answer = ? WHERE faq_id = ? AND language = ?", [
				question,
				answer,
				id,
				language,
			]);
		} else {
			// Create new translation
			await dbPool.executeQuery("INSERT INTO faq_translations (faq_id, language, question, answer) VALUES (?, ?, ?, ?)", [
				id,
				language,
				question,
				answer,
			]);
		}
	} catch (error) {
		throw new Error(`Error updating FAQ translation: ${error.message}`);
	}
};

/**
 * Delete FAQ and all its translations
 * @param {string} id - FAQ ID
 * @returns {Promise<void>}
 */
export const remove = async (id) => {
	try {
		// Deleting the FAQ will cascade delete translations due to foreign key constraint
		await dbPool.executeQuery("DELETE FROM faqs WHERE id = ?", [id]);
	} catch (error) {
		throw new Error(`Error deleting FAQ: ${error.message}`);
	}
};

/**
 * Get all translations for a FAQ
 * @param {string} id - FAQ ID
 * @returns {Promise<Array>} Array of translation objects
 */
export const getTranslations = async (id) => {
	try {
		const query = `
      SELECT language, question, answer
      FROM faq_translations
      WHERE faq_id = ?
    `;
		return await dbPool.executeQuery(query, [id]);
	} catch (error) {
		throw new Error(`Error getting FAQ translations: ${error.message}`);
	}
};

export default {
	findById,
	findAll,
	countAll,
	create,
	updateTranslation,
	remove,
	getTranslations,
};
