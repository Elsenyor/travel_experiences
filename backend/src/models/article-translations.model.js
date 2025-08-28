import dbPool from "../utils/database.pool.js";

/**
 * Find all translations for an article
 * @param {number} articleId - Article ID
 * @returns {Promise<Array>} Array of translations
 */
export const findByArticleId = async (articleId) => {
	const query = "SELECT id, article_id, language, title, content, created_at, updated_at FROM article_translations WHERE article_id = ?";
	try {
		return await dbPool.executeQuery(query, [articleId]);
	} catch (error) {
		throw new Error(`Error finding article translations: ${error.message}`);
	}
};

/**
 * Find translation by article ID and language
 * @param {number} articleId - Article ID
 * @param {string} language - Language code
 * @returns {Promise<Object|null>} Translation object or null if not found
 */
export const findByArticleIdAndLanguage = async (articleId, language) => {
	const query =
		"SELECT id, article_id, language, title, content, created_at, updated_at FROM article_translations WHERE article_id = ? AND language = ?";
	try {
		const translation = await dbPool.executeQuery(query, [articleId, language]);
		return translation[0] || null;
	} catch (error) {
		throw new Error(`Error finding article translation: ${error.message}`);
	}
};

/**
 * Create new translation for an article
 * @param {Object} translationData - Translation data
 * @param {number} translationData.article_id - Article ID
 * @param {string} translationData.language - Language code
 * @param {string} translationData.title - Article title
 * @param {string} translationData.content - Article content
 * @returns {Promise<number>} Created translation ID
 */
export const create = async ({ article_id, language, title, content }) => {
	const query = "INSERT INTO article_translations (article_id, language, title, content) VALUES (?, ?, ?, ?)";
	try {
		const result = await dbPool.executeQuery(query, [article_id, language, title, content]);
		return result.insertId;
	} catch (error) {
		if (error.code === "ER_DUP_ENTRY") {
			throw new Error(`Translation for language ${language} already exists for this article`);
		}
		throw new Error(`Error creating article translation: ${error.message}`);
	}
};

/**
 * Update translation data
 * @param {number} id - Translation ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<boolean>} True if updated, false otherwise
 */
export const update = async (id, updateData) => {
	const allowedFields = ["title", "content"];
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
	const query = `UPDATE article_translations SET ${updates.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;

	try {
		const result = await dbPool.executeQuery(query, values);
		return result.affectedRows > 0;
	} catch (error) {
		throw new Error(`Error updating article translation: ${error.message}`);
	}
};

/**
 * Remove translation
 * @param {number} id - Translation ID
 * @returns {Promise<boolean>} True if removed, false otherwise
 */
export const remove = async (id) => {
	const query = "DELETE FROM article_translations WHERE id = ?";
	try {
		const result = await dbPool.executeQuery(query, [id]);
		return result.affectedRows > 0;
	} catch (error) {
		throw new Error(`Error deleting article translation: ${error.message}`);
	}
};

/**
 * Remove all translations for an article
 * @param {number} articleId - Article ID
 * @returns {Promise<boolean>} True if removed, false otherwise
 */
export const removeByArticleId = async (articleId) => {
	const query = "DELETE FROM article_translations WHERE article_id = ?";
	try {
		const result = await dbPool.executeQuery(query, [articleId]);
		return result.affectedRows > 0;
	} catch (error) {
		throw new Error(`Error deleting article translations: ${error.message}`);
	}
};

export default {
	findByArticleId,
	findByArticleIdAndLanguage,
	create,
	update,
	remove,
	removeByArticleId,
};
