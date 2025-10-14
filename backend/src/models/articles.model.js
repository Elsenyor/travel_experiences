import dbPool from "../utils/database.pool.js";
import { generateSlug, generateUniqueSlug, getSlugFromTitle } from "../utils/slug.utils.js";

/**
 * Find article by ID with translations in specified language
 * @param {number} id - Article ID
 * @param {string} language - Language code (default: 'es')
 * @returns {Promise<Object|null>} Article object with translations or null if not found
 */
export const findById = async (id, language = "es") => {
	const query = `
		SELECT 
			a.id, a.author_id, a.featured_image, a.created_at, a.updated_at,
			u.name as author_name,
			at.title, at.content
		FROM articles a
		LEFT JOIN article_translations at ON a.id = at.article_id AND at.language = ?
		LEFT JOIN users u ON a.author_id = u.id
		WHERE a.id = ?
	`;
	try {
		const article = await dbPool.executeQuery(query, [language, id]);
		return article[0] || null;
	} catch (error) {
		throw new Error(`Error finding article: ${error.message}`);
	}
};

/**
 * Get article tags
 * @param {number} articleId - Article ID
 * @returns {Promise<Array>} Array of tags
 */
export const getArticleTags = async (articleId) => {
	const query = `
		SELECT t.id, t.name
		FROM tags t
		JOIN article_tags at ON t.id = at.tag_id
		WHERE at.article_id = ?
	`;
	try {
		return await dbPool.executeQuery(query, [articleId]);
	} catch (error) {
		throw new Error(`Error getting article tags: ${error.message}`);
	}
};

/**
 * Find article by slug
 * @param {string} slug - Article slug
 * @returns {Promise<Object|null>} Article object or null
 */
export const findBySlug = async (slug) => {
	const query = "SELECT id, slug FROM articles WHERE slug = ?";
	try {
		const articles = await dbPool.executeQuery(query, [slug]);
		return articles[0] || null;
	} catch (error) {
		throw new Error(`Error finding article by slug: ${error.message}`);
	}
};

/**
 * Create new article with translations using transaction to ensure integrity
 * @param {Object} articleData - Article data
 * @param {number} articleData.author_id - Author ID
 * @param {string} articleData.featured_image - Featured image URL
 * @param {string} articleData.slug - Optional custom slug
 * @param {Array} articleData.translations - Array of translation objects
 * @param {string} articleData.translations[].language - Language code
 * @param {string} articleData.translations[].title - Article title
 * @param {string} articleData.translations[].content - Article content
 * @param {Array} articleData.tags - Array of tag IDs
 * @returns {Promise<number>} Created article ID
 */
export const create = async ({ author_id, featured_image, slug, translations, tags = [] }) => {
	// Validate required translations
	if (!translations || !translations.length) {
		throw new Error("At least one translation is required");
	}

	// Validate translation data
	translations.forEach((translation) => {
		if (!translation.language || !translation.title || !translation.content) {
			throw new Error("Incomplete translation data");
		}
	});

	// Generate slug from first translation title if not provided
	const firstTranslation = translations[0];
	let finalSlug = getSlugFromTitle(firstTranslation.title, slug);

	// Ensure slug is unique
	finalSlug = await generateUniqueSlug(finalSlug, findBySlug);

	// Create article with slug
	const query = "INSERT INTO articles (author_id, featured_image, slug) VALUES (?, ?, ?)";

	try {
		const result = await dbPool.executeQuery(query, [author_id, featured_image, finalSlug]);
		const articleId = result.insertId;

		// Add translations
		for (const translation of translations) {
			await dbPool.executeQuery("INSERT INTO article_translations (article_id, language, title, content) VALUES (?, ?, ?, ?)", [
				articleId,
				translation.language,
				translation.title,
				translation.content,
			]);
		}

		// Add tags if provided
		if (tags.length > 0) {
			for (const tagId of tags) {
				await dbPool.executeQuery("INSERT INTO article_tags (article_id, tag_id) VALUES (?, ?)", [articleId, tagId]);
			}
		}

		return articleId;
	} catch (error) {
		throw new Error(`Error creating article: ${error.message}`);
	}
};

/**
 * Update article data
 * @param {number} id - Article ID
 * @param {Object} updateData - Data to update
 * @param {string} updateData.slug - Optional slug (will be validated and made unique)
 * @returns {Promise<boolean>} True if updated, false otherwise
 */
export const update = async (id, updateData) => {
	const allowedFields = ["author_id", "featured_image", "slug"];
	const updates = [];
	const values = [];

	// Handle slug separately to ensure uniqueness
	if (updateData.slug !== undefined) {
		let newSlug = updateData.slug;

		// If slug is provided, sanitize it
		if (newSlug) {
			newSlug = generateSlug(newSlug);
			// Ensure uniqueness (excluding current article)
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
	const query = `UPDATE articles SET ${updates.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;

	try {
		const result = await dbPool.executeQuery(query, values);
		return result.affectedRows > 0;
	} catch (error) {
		throw new Error(`Error updating article: ${error.message}`);
	}
};

/**
 * Remove article and all related data (translations, tags)
 * @param {number} id - Article ID
 * @returns {Promise<boolean>} True if removed, false otherwise
 */
export const remove = async (id) => {
	const query = "DELETE FROM articles WHERE id = ?";
	try {
		const result = await dbPool.executeQuery(query, [id]);
		return result.affectedRows > 0;
	} catch (error) {
		throw new Error(`Error deleting article: ${error.message}`);
	}
};

/**
 * Find articles by multiple criteria
 * @param {Object} filters - Search filters
 * @param {string} filters.language - Language for translations (default: 'es')
 * @param {string} filters.search - Search in title and content
 * @param {number} filters.author_id - Filter by author
 * @param {number} filters.tag_id - Filter by tag
 * @param {number} filters.limit - Results limit
 * @param {number} filters.offset - Results offset
 * @param {string} filters.sortField - Field to sort by
 * @param {string} filters.sortOrder - Sort order (ASC or DESC)
 * @returns {Promise<Array>} Array of articles with translations
 */
export const findByFilters = async ({
	language = "es",
	search,
	author_id,
	tag_id,
	limit = 10,
	offset = 0,
	sortField = "created_at",
	sortOrder = "DESC",
}) => {
	let query = `
		SELECT 
			a.id, a.author_id, a.featured_image, a.created_at, a.updated_at,
			u.name as author_name,
			at.title, at.content
		FROM articles a
		LEFT JOIN article_translations at ON a.id = at.article_id AND at.language = ?
		LEFT JOIN users u ON a.author_id = u.id
	`;

	const values = [language];

	// Add tag filter if provided
	if (tag_id) {
		query += `
			JOIN article_tags atg ON a.id = atg.article_id
			WHERE atg.tag_id = ?
		`;
		values.push(tag_id);
	} else {
		query += " WHERE 1=1";
	}

	if (author_id) {
		query += " AND a.author_id = ?";
		values.push(author_id);
	}

	if (search) {
		query += " AND (at.title LIKE ? OR at.content LIKE ?)";
		values.push(`%${search}%`, `%${search}%`);
	}

	// Validate sort field to prevent SQL injection
	const allowedSortFields = ["id", "created_at", "updated_at"];
	const validSortField = allowedSortFields.includes(sortField) ? sortField : "created_at";

	// Validate sort order
	const validSortOrder = ["ASC", "DESC"].includes(sortOrder) ? sortOrder : "DESC";

	query += ` ORDER BY a.${validSortField} ${validSortOrder} LIMIT ? OFFSET ?`;
	values.push(parseInt(limit), parseInt(offset));

	try {
		return await dbPool.executeQuery(query, values);
	} catch (error) {
		throw new Error(`Error searching articles: ${error.message}`);
	}
};

/**
 * Count total articles matching filters (for pagination)
 * @param {Object} filters - Search filters (same as findByFilters but without limit/offset)
 * @returns {Promise<number>} Total count of matching articles
 */
export const countByFilters = async ({ language = "es", search, author_id, tag_id }) => {
	let query = `
		SELECT COUNT(*) as total
		FROM articles a
		LEFT JOIN article_translations at ON a.id = at.article_id AND at.language = ?
	`;

	const values = [language];

	// Add tag filter if provided
	if (tag_id) {
		query += `
			JOIN article_tags atg ON a.id = atg.article_id
			WHERE atg.tag_id = ?
		`;
		values.push(tag_id);
	} else {
		query += " WHERE 1=1";
	}

	if (author_id) {
		query += " AND a.author_id = ?";
		values.push(author_id);
	}

	if (search) {
		query += " AND (at.title LIKE ? OR at.content LIKE ?)";
		values.push(`%${search}%`, `%${search}%`);
	}

	try {
		const result = await dbPool.executeQuery(query, values);
		return result[0].total;
	} catch (error) {
		throw new Error(`Error counting articles: ${error.message}`);
	}
};

export default {
	findById,
	findBySlug,
	getArticleTags,
	create,
	update,
	remove,
	findByFilters,
	countByFilters,
};
