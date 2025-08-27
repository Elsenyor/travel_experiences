/**
 * Utility functions for formatting API responses
 * These functions help standardize response formats across the API
 * and provide specific formatting for React Admin compatibility
 */

/**
 * Format a success response
 *
 * @param {*} data - Response data
 * @param {string} message - Optional success message
 * @returns {Object} Formatted success response
 */
export const formatSuccess = (data, message = "") => {
	return {
		status: "success",
		data,
		message,
	};
};

/**
 * Format a paginated response for React Admin
 *
 * @param {Array} data - Array of resources
 * @param {number} total - Total count of resources
 * @param {Object} pagination - Pagination metadata
 * @returns {Object} Formatted paginated response
 */
export const formatPaginatedResponse = (data, total, pagination = {}) => {
	return {
		status: "success",
		data,
		total,
		pagination,
	};
};

/**
 * Format an error response
 *
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {*} errors - Optional additional error details
 * @returns {Object} Formatted error response
 */
export const formatError = (message, statusCode = 400, errors = null) => {
	return {
		status: "error",
		message,
		statusCode,
		errors,
	};
};

/**
 * Format a response specifically for React Admin list views
 *
 * @param {Array} data - Array of resources
 * @param {number} total - Total count of resources
 * @returns {Object} Formatted response for React Admin
 */
export const formatReactAdminList = (data, total) => {
	return {
		data,
		total,
	};
};

/**
 * Format a response specifically for React Admin get one view
 *
 * @param {Object} data - Resource data
 * @returns {Object} Formatted response for React Admin
 */
export const formatReactAdminGetOne = (data) => {
	return {
		data,
	};
};

/**
 * Format a response for React Admin create/update operations
 *
 * @param {Object} data - Created/updated resource data
 * @returns {Object} Formatted response for React Admin
 */
export const formatReactAdminSave = (data) => {
	return {
		data,
	};
};

/**
 * Format a response for React Admin delete operation
 *
 * @param {Object} data - Deleted resource data (or just the ID)
 * @returns {Object} Formatted response for React Admin
 */
export const formatReactAdminDelete = (data) => {
	return {
		data,
	};
};

export default {
	formatSuccess,
	formatPaginatedResponse,
	formatError,
	formatReactAdminList,
	formatReactAdminGetOne,
	formatReactAdminSave,
	formatReactAdminDelete,
};
