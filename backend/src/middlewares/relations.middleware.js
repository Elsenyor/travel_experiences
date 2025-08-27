/**
 * Middleware for handling nested relations in API responses
 */

import { getRelationParams } from "../utils/relation-manager.js";

/**
 * Parse relation parameters from request query
 * This middleware extracts relation parameters and adds them to the request object
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const parseRelationParams = (req, res, next) => {
	req.relationParams = getRelationParams(req);
	next();
};

/**
 * Middleware to handle nested relations in responses
 * This middleware can be used to automatically include or exclude relations
 * based on the request parameters
 *
 * @param {Object} relationConfig - Configuration for relation handling
 * @returns {Function} Express middleware function
 */
export const handleRelations = (relationConfig = {}) => {
	return (req, res, next) => {
		// Store the original json function to intercept it
		const originalJson = res.json;

		// Override the json function
		res.json = function (body) {
			try {
				// Only process if we have data and relation parameters
				if (body && (body.data || Array.isArray(body)) && req.relationParams) {
					const { include, exclude } = req.relationParams;

					// Only process if we have include or exclude parameters
					if (include.length > 0 || exclude.length > 0) {
						// Determine which relations to include
						const relationsToInclude = {};

						// If we have include parameters, only include those relations
						if (include.length > 0) {
							include.forEach((relationName) => {
								if (relationConfig[relationName]) {
									relationsToInclude[relationName] = relationConfig[relationName];
								}
							});
						}
						// Otherwise, include all relations except those excluded
						else {
							Object.keys(relationConfig).forEach((relationName) => {
								if (!exclude.includes(relationName)) {
									relationsToInclude[relationName] = relationConfig[relationName];
								}
							});
						}

						// Process the response body to include relations
						// This part would need to be implemented based on your data structure
						// For now, we just pass through the body
					}
				}
			} catch (error) {
				console.error("Error handling relations:", error);
			}

			// Call the original json function
			return originalJson.call(this, body);
		};

		next();
	};
};

export default {
	parseRelationParams,
	handleRelations,
};
