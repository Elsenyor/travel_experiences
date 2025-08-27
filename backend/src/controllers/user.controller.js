import UserModel from "../models/users.model.js";
import { AppError } from "../middlewares/error.middleware.js";
import { setContentRange } from "../middlewares/content-range.middleware.js";
import { formatReactAdminList, formatReactAdminGetOne, formatReactAdminSave } from "../utils/response.formatter.js";

/**
 * Get user by ID
 * Compatible with React Admin getOne
 */
export const getUserById = async (req, res, next) => {
	try {
		const user = await UserModel.findById(req.params.id);
		if (!user) {
			throw new AppError("User not found", 404);
		}

		// Format response for React Admin
		res.json(formatReactAdminGetOne(user));
	} catch (error) {
		next(error);
	}
};

/**
 * Create new user
 * Compatible with React Admin create
 */
export const createUser = async (req, res, next) => {
	try {
		const userId = await UserModel.create(req.body);

		// Get the created user to return full object (React Admin expects the full resource)
		const user = await UserModel.findById(userId);

		res.status(201).json(formatReactAdminSave(user));
	} catch (error) {
		if (error.message === "Email already exists") {
			next(new AppError("Email already in use", 400));
		} else {
			next(error);
		}
	}
};

/**
 * Update user
 * Compatible with React Admin update
 */
export const updateUser = async (req, res, next) => {
	try {
		const { id } = req.params;
		const updated = await UserModel.update(id, req.body);

		if (!updated) {
			throw new AppError("User not found or no changes made", 404);
		}

		// Get the updated user to return full object
		const user = await UserModel.findById(id);

		res.json(formatReactAdminSave(user));
	} catch (error) {
		next(error);
	}
};

/**
 * Delete user
 * Compatible with React Admin delete
 */
export const deleteUser = async (req, res, next) => {
	try {
		const { id } = req.params;

		// Get user before deletion for the response
		const user = await UserModel.findById(id);

		if (!user) {
			throw new AppError("User not found", 404);
		}

		const deleted = await UserModel.remove(id);

		if (!deleted) {
			throw new AppError("Failed to delete user", 500);
		}

		res.json(formatReactAdminSave({ id }));
	} catch (error) {
		next(error);
	}
};

/**
 * Search users with filters, sorting, and pagination
 * Compatible with React Admin getList
 */
export const searchUsers = async (req, res, next) => {
	try {
		// Use React Admin params if available, otherwise use standard query params
		const params = req.reactAdminParams || {};
		const filters = params.filters || {};
		const pagination = params.pagination || { offset: 0, limit: 10 };
		const sort = params.sort || { field: "created_at", order: "DESC" };

		// Map React Admin filters to our model's expected format
		const users = await UserModel.findByFilters({
			role: filters.role,
			searchTerm: params.search || filters.q,
			limit: pagination.limit,
			offset: pagination.offset,
			sortField: sort.field,
			sortOrder: sort.order,
		});

		// Get total count for pagination
		const count = await UserModel.countByFilters({
			role: filters.role,
			searchTerm: params.search || filters.q,
		});

		// Set Content-Range header for React Admin
		setContentRange(req, res, count);

		// Format response for React Admin
		res.json(formatReactAdminList(users, count));
	} catch (error) {
		next(error);
	}
};

/**
 * Bulk delete users
 * Compatible with React Admin deleteMany
 */
export const bulkDeleteUsers = async (req, res, next) => {
	try {
		const { ids } = req.body;

		if (!ids || !Array.isArray(ids) || ids.length === 0) {
			throw new AppError("No user IDs provided", 400);
		}

		// Delete each user
		const results = await Promise.all(
			ids.map(async (id) => {
				try {
					await UserModel.remove(id);
					return { id, deleted: true };
				} catch (error) {
					return { id, deleted: false, error: error.message };
				}
			})
		);

		// Count successful deletions
		const successCount = results.filter((r) => r.deleted).length;

		res.json({ data: ids });
	} catch (error) {
		next(error);
	}
};

/**
 * Bulk update users
 * Compatible with React Admin updateMany
 */
export const bulkUpdateUsers = async (req, res, next) => {
	try {
		const { ids, data } = req.body;

		if (!ids || !Array.isArray(ids) || ids.length === 0) {
			throw new AppError("No user IDs provided", 400);
		}

		if (!data || Object.keys(data).length === 0) {
			throw new AppError("No update data provided", 400);
		}

		// Update each user
		const results = await Promise.all(
			ids.map(async (id) => {
				try {
					await UserModel.update(id, data);
					return { id, updated: true };
				} catch (error) {
					return { id, updated: false, error: error.message };
				}
			})
		);

		// Count successful updates
		const successCount = results.filter((r) => r.updated).length;

		res.json({ data: ids });
	} catch (error) {
		next(error);
	}
};

export default {
	getUserById,
	createUser,
	updateUser,
	deleteUser,
	searchUsers,
	bulkDeleteUsers,
	bulkUpdateUsers,
};
