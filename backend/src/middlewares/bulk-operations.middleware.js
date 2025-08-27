/**
 * Middleware and utilities for handling bulk operations
 * These functions help implement React Admin's bulk update and delete operations
 */

import { AppError } from "./error.middleware.js";

/**
 * Process a bulk delete operation
 *
 * @param {Function} deleteFunction - Function to delete a single resource
 * @param {Array} ids - Array of resource IDs to delete
 * @returns {Promise<Object>} Result of the bulk operation
 */
export const processBulkDelete = async (deleteFunction, ids) => {
	if (!ids || !Array.isArray(ids) || ids.length === 0) {
		throw new AppError("No IDs provided for bulk delete operation", 400);
	}

	const results = await Promise.allSettled(
		ids.map(async (id) => {
			try {
				const result = await deleteFunction(id);
				return { id, success: !!result, error: null };
			} catch (error) {
				return { id, success: false, error: error.message };
			}
		})
	);

	// Count successful and failed operations
	const successful = results.filter((r) => r.value && r.value.success).length;
	const failed = ids.length - successful;

	return {
		data: ids,
		meta: {
			successful,
			failed,
			results: results.map((r) => r.value),
		},
	};
};

/**
 * Process a bulk update operation
 *
 * @param {Function} updateFunction - Function to update a single resource
 * @param {Array} ids - Array of resource IDs to update
 * @param {Object} data - Data to apply to all resources
 * @returns {Promise<Object>} Result of the bulk operation
 */
export const processBulkUpdate = async (updateFunction, ids, data) => {
	if (!ids || !Array.isArray(ids) || ids.length === 0) {
		throw new AppError("No IDs provided for bulk update operation", 400);
	}

	if (!data || Object.keys(data).length === 0) {
		throw new AppError("No update data provided", 400);
	}

	const results = await Promise.allSettled(
		ids.map(async (id) => {
			try {
				const result = await updateFunction(id, data);
				return { id, success: !!result, error: null };
			} catch (error) {
				return { id, success: false, error: error.message };
			}
		})
	);

	// Count successful and failed operations
	const successful = results.filter((r) => r.value && r.value.success).length;
	const failed = ids.length - successful;

	return {
		data: ids,
		meta: {
			successful,
			failed,
			results: results.map((r) => r.value),
		},
	};
};

/**
 * Middleware for handling bulk operations
 * This middleware processes the request body for bulk operations
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const handleBulkOperations = (req, res, next) => {
	// Check if this is a bulk operation request
	const isBulkOperation = req.path.includes("/bulk/");

	if (isBulkOperation) {
		// Validate request body
		if (!req.body) {
			return next(new AppError("Request body is required for bulk operations", 400));
		}

		// For delete operations, convert { ids: [1,2,3] } to { ids: [1,2,3] }
		// This is already the format we expect, but this middleware could transform other formats

		// For update operations, ensure we have both ids and data
		if (req.path.includes("/update") && (!req.body.ids || !req.body.data)) {
			return next(new AppError("Both 'ids' and 'data' are required for bulk update operations", 400));
		}
	}

	next();
};

export default {
	processBulkDelete,
	processBulkUpdate,
	handleBulkOperations,
};
