import dbPool from "../utils/database.pool.js";

/**
 * Find user by ID
 * @param {number} id - User ID
 * @returns {Promise<Object|null>} User object or null if not found
 */
export const findById = async (id) => {
	const query = "SELECT id, name, email, role, created_at FROM users WHERE id = ?";
	try {
		const user = await dbPool.executeQuery(query, [id]);
		return user[0] || null;
	} catch (error) {
		throw new Error(`Error finding user: ${error.message}`);
	}
};

/**
 * Create new user with transaction to ensure integrity
 * @param {Object} userData - User data
 * @param {string} userData.name - User name
 * @param {string} userData.email - User email
 * @param {string} userData.password - User password (hashed)
 * @param {string} userData.role - User role (default: "user")
 * @returns {Promise<number>} Created user ID
 */
export const create = async ({ name, email, password, role = "user" }) => {
	const queries = [
		["SELECT id FROM users WHERE email = ?", [email]],
		["INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)", [name, email, password, role]],
	];

	try {
		const results = await dbPool.executeTransaction(queries);
		if (results[0].length > 0) {
			throw new Error("Email already exists");
		}
		return results[1].insertId;
	} catch (error) {
		throw new Error(`Error creating user: ${error.message}`);
	}
};

/**
 * Update user data
 * @param {number} id - User ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<boolean>} True if updated, false otherwise
 */
export const update = async (id, updateData) => {
	const allowedFields = ["name", "email", "role"];
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
	const query = `UPDATE users SET ${updates.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;

	try {
		const result = await dbPool.executeQuery(query, values);
		return result.affectedRows > 0;
	} catch (error) {
		throw new Error(`Error updating user: ${error.message}`);
	}
};

/**
 * Remove user
 * @param {number} id - User ID
 * @returns {Promise<boolean>} True if removed, false otherwise
 */
export const remove = async (id) => {
	const query = "DELETE FROM users WHERE id = ?";
	try {
		const result = await dbPool.executeQuery(query, [id]);
		return result.affectedRows > 0;
	} catch (error) {
		throw new Error(`Error deleting user: ${error.message}`);
	}
};

/**
 * Find users by multiple criteria
 * @param {Object} filters - Search filters
 * @param {string} filters.role - Filter by role
 * @param {string} filters.searchTerm - Search in name and email
 * @param {number} filters.limit - Results limit
 * @param {number} filters.offset - Results offset
 * @param {string} filters.sortField - Field to sort by
 * @param {string} filters.sortOrder - Sort order (ASC or DESC)
 * @returns {Promise<Array>} Array of users
 */
export const findByFilters = async ({ role, searchTerm, limit = 10, offset = 0, sortField = "created_at", sortOrder = "DESC" }) => {
	let query = "SELECT id, name, email, role, created_at FROM users WHERE 1=1";
	const values = [];

	if (role) {
		query += " AND role = ?";
		values.push(role);
	}

	if (searchTerm) {
		query += " AND (name LIKE ? OR email LIKE ?)";
		values.push(`%${searchTerm}%`, `%${searchTerm}%`);
	}

	// Validate sort field to prevent SQL injection
	const allowedSortFields = ["id", "name", "email", "role", "created_at"];
	const validSortField = allowedSortFields.includes(sortField) ? sortField : "created_at";

	// Validate sort order
	const validSortOrder = ["ASC", "DESC"].includes(sortOrder) ? sortOrder : "DESC";

	query += ` ORDER BY ${validSortField} ${validSortOrder} LIMIT ? OFFSET ?`;
	values.push(parseInt(limit), parseInt(offset));

	try {
		return await dbPool.executeQuery(query, values);
	} catch (error) {
		throw new Error(`Error searching users: ${error.message}`);
	}
};

/**
 * Count users by filters
 * @param {Object} filters - Search filters
 * @param {string} filters.role - Filter by role
 * @param {string} filters.searchTerm - Search in name and email
 * @returns {Promise<number>} Count of matching users
 */
export const countByFilters = async ({ role, searchTerm }) => {
	let query = "SELECT COUNT(*) as total FROM users WHERE 1=1";
	const values = [];

	if (role) {
		query += " AND role = ?";
		values.push(role);
	}

	if (searchTerm) {
		query += " AND (name LIKE ? OR email LIKE ?)";
		values.push(`%${searchTerm}%`, `%${searchTerm}%`);
	}

	try {
		const result = await dbPool.executeQuery(query, values);
		return result[0].total;
	} catch (error) {
		throw new Error(`Error counting users: ${error.message}`);
	}
};

export default {
	findById,
	create,
	update,
	remove,
	findByFilters,
	countByFilters,
};
