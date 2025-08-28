import dbPool from "../utils/database.pool.js";

/**
 * Find tag by ID
 * @param {number} id - Tag ID
 * @returns {Promise<Object|null>} Tag object or null if not found
 */
export const findById = async (id) => {
	const query = "SELECT id, name, created_at FROM tags WHERE id = ?";
	try {
		const tag = await dbPool.executeQuery(query, [id]);
		return tag[0] || null;
	} catch (error) {
		throw new Error(`Error finding tag: ${error.message}`);
	}
};

/**
 * Find tag by name
 * @param {string} name - Tag name
 * @returns {Promise<Object|null>} Tag object or null if not found
 */
export const findByName = async (name) => {
	const query = "SELECT id, name, created_at FROM tags WHERE name = ?";
	try {
		const tag = await dbPool.executeQuery(query, [name]);
		return tag[0] || null;
	} catch (error) {
		throw new Error(`Error finding tag: ${error.message}`);
	}
};

/**
 * Create new tag
 * @param {string} name - Tag name
 * @returns {Promise<number>} Created tag ID
 */
export const create = async (name) => {
	const query = "INSERT INTO tags (name) VALUES (?)";
	try {
		const result = await dbPool.executeQuery(query, [name]);
		return result.insertId;
	} catch (error) {
		if (error.code === "ER_DUP_ENTRY") {
			throw new Error(`Tag '${name}' already exists`);
		}
		throw new Error(`Error creating tag: ${error.message}`);
	}
};

/**
 * Find or create tag
 * @param {string} name - Tag name
 * @returns {Promise<number>} Tag ID
 */
export const findOrCreate = async (name) => {
	try {
		const existingTag = await findByName(name);
		if (existingTag) {
			return existingTag.id;
		}
		return await create(name);
	} catch (error) {
		throw new Error(`Error finding or creating tag: ${error.message}`);
	}
};

/**
 * Update tag
 * @param {number} id - Tag ID
 * @param {string} name - New tag name
 * @returns {Promise<boolean>} True if updated, false otherwise
 */
export const update = async (id, name) => {
	const query = "UPDATE tags SET name = ? WHERE id = ?";
	try {
		const result = await dbPool.executeQuery(query, [name, id]);
		return result.affectedRows > 0;
	} catch (error) {
		if (error.code === "ER_DUP_ENTRY") {
			throw new Error(`Tag '${name}' already exists`);
		}
		throw new Error(`Error updating tag: ${error.message}`);
	}
};

/**
 * Remove tag
 * @param {number} id - Tag ID
 * @returns {Promise<boolean>} True if removed, false otherwise
 */
export const remove = async (id) => {
	const query = "DELETE FROM tags WHERE id = ?";
	try {
		const result = await dbPool.executeQuery(query, [id]);
		return result.affectedRows > 0;
	} catch (error) {
		throw new Error(`Error deleting tag: ${error.message}`);
	}
};

/**
 * Get all tags
 * @param {Object} options - Query options
 * @param {string} options.search - Search in tag name
 * @param {number} options.limit - Results limit
 * @param {number} options.offset - Results offset
 * @returns {Promise<Array>} Array of tags
 */
export const getAll = async ({ search, limit = 100, offset = 0 } = {}) => {
	let query = "SELECT id, name, created_at FROM tags";
	const values = [];

	if (search) {
		query += " WHERE name LIKE ?";
		values.push(`%${search}%`);
	}

	query += " ORDER BY name ASC LIMIT ? OFFSET ?";
	values.push(parseInt(limit), parseInt(offset));

	try {
		return await dbPool.executeQuery(query, values);
	} catch (error) {
		throw new Error(`Error getting tags: ${error.message}`);
	}
};

/**
 * Count total tags (for pagination)
 * @param {Object} options - Query options
 * @param {string} options.search - Search in tag name
 * @returns {Promise<number>} Total count of tags
 */
export const count = async ({ search } = {}) => {
	let query = "SELECT COUNT(*) as total FROM tags";
	const values = [];

	if (search) {
		query += " WHERE name LIKE ?";
		values.push(`%${search}%`);
	}

	try {
		const result = await dbPool.executeQuery(query, values);
		return result[0].total;
	} catch (error) {
		throw new Error(`Error counting tags: ${error.message}`);
	}
};

/**
 * Add tag to article
 * @param {number} articleId - Article ID
 * @param {number} tagId - Tag ID
 * @returns {Promise<boolean>} True if added, false otherwise
 */
export const addTagToArticle = async (articleId, tagId) => {
	const query = "INSERT INTO article_tags (article_id, tag_id) VALUES (?, ?)";
	try {
		await dbPool.executeQuery(query, [articleId, tagId]);
		return true;
	} catch (error) {
		if (error.code === "ER_DUP_ENTRY") {
			return true; // Tag already added to article
		}
		throw new Error(`Error adding tag to article: ${error.message}`);
	}
};

/**
 * Remove tag from article
 * @param {number} articleId - Article ID
 * @param {number} tagId - Tag ID
 * @returns {Promise<boolean>} True if removed, false otherwise
 */
export const removeTagFromArticle = async (articleId, tagId) => {
	const query = "DELETE FROM article_tags WHERE article_id = ? AND tag_id = ?";
	try {
		const result = await dbPool.executeQuery(query, [articleId, tagId]);
		return result.affectedRows > 0;
	} catch (error) {
		throw new Error(`Error removing tag from article: ${error.message}`);
	}
};

/**
 * Set article tags (replace all existing tags)
 * @param {number} articleId - Article ID
 * @param {Array<number>} tagIds - Array of tag IDs
 * @returns {Promise<boolean>} True if successful
 */
export const setArticleTags = async (articleId, tagIds) => {
	const queries = [["DELETE FROM article_tags WHERE article_id = ?", [articleId]]];

	// Add queries to insert new tags
	if (tagIds && tagIds.length > 0) {
		tagIds.forEach((tagId) => {
			queries.push(["INSERT INTO article_tags (article_id, tag_id) VALUES (?, ?)", [articleId, tagId]]);
		});
	}

	try {
		await dbPool.executeTransaction(queries);
		return true;
	} catch (error) {
		throw new Error(`Error setting article tags: ${error.message}`);
	}
};

/**
 * Get tags for article
 * @param {number} articleId - Article ID
 * @returns {Promise<Array>} Array of tags
 */
export const getArticleTags = async (articleId) => {
	const query = `
		SELECT t.id, t.name, t.created_at
		FROM tags t
		JOIN article_tags at ON t.id = at.tag_id
		WHERE at.article_id = ?
		ORDER BY t.name ASC
	`;
	try {
		return await dbPool.executeQuery(query, [articleId]);
	} catch (error) {
		throw new Error(`Error getting article tags: ${error.message}`);
	}
};

export default {
	findById,
	findByName,
	create,
	findOrCreate,
	update,
	remove,
	getAll,
	count,
	addTagToArticle,
	removeTagFromArticle,
	setArticleTags,
	getArticleTags,
};
