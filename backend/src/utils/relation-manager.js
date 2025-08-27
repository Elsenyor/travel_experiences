/**
 * Utility functions for managing nested relations in API responses
 * These functions help optimize and format responses with related data
 */

/**
 * Process a list of resources to include related data
 *
 * @param {Array} resources - Array of main resources
 * @param {Object} relations - Object mapping relation names to arrays of related data
 * @param {Object} options - Options for processing relations
 * @returns {Array} Resources with included relations
 */
export const includeRelations = (resources, relations, options = {}) => {
	if (!resources || !Array.isArray(resources) || resources.length === 0) {
		return resources;
	}

	if (!relations || typeof relations !== "object") {
		return resources;
	}

	const { idField = "id", flatten = false, singleRelations = [] } = options;

	// Create a map of resources by ID for faster lookup
	const resourceMap = resources.reduce((map, resource) => {
		map[resource[idField]] = resource;
		return map;
	}, {});

	// Process each relation
	Object.keys(relations).forEach((relationName) => {
		const relationData = relations[relationName];

		if (!relationData || !Array.isArray(relationData)) {
			return;
		}

		// Determine if this is a one-to-one or one-to-many relation
		const isSingleRelation = singleRelations.includes(relationName);

		// Group relation data by foreign key
		const relationsByForeignKey = relationData.reduce((map, item) => {
			const foreignKeyField = `${relationName.slice(0, -1)}_id`; // e.g., "translations" -> "translation_id"
			const foreignKey = item[foreignKeyField];

			if (!map[foreignKey]) {
				map[foreignKey] = [];
			}

			map[foreignKey].push(item);
			return map;
		}, {});

		// Add relations to each resource
		resources.forEach((resource) => {
			const resourceId = resource[idField];
			const resourceRelations = relationsByForeignKey[resourceId] || [];

			if (isSingleRelation && resourceRelations.length > 0) {
				// For one-to-one relations, just add the first item
				resource[relationName] = resourceRelations[0];
			} else {
				// For one-to-many relations, add the array
				resource[relationName] = resourceRelations;
			}
		});
	});

	// Optionally flatten the structure for simpler consumption
	if (flatten) {
		resources = resources.map((resource) => {
			const result = { ...resource };

			Object.keys(relations).forEach((relationName) => {
				if (resource[relationName]) {
					if (Array.isArray(resource[relationName])) {
						resource[relationName].forEach((related, index) => {
							Object.keys(related).forEach((key) => {
								// Skip the foreign key
								if (key === `${relationName.slice(0, -1)}_id`) {
									return;
								}

								result[`${relationName}_${index}_${key}`] = related[key];
							});
						});
					} else {
						Object.keys(resource[relationName]).forEach((key) => {
							// Skip the foreign key
							if (key === `${relationName}_id`) {
								return;
							}

							result[`${relationName}_${key}`] = resource[relationName][key];
						});
					}

					delete result[relationName];
				}
			});

			return result;
		});
	}

	return resources;
};

/**
 * Process a single resource to include related data
 *
 * @param {Object} resource - Main resource
 * @param {Object} relations - Object mapping relation names to arrays of related data
 * @param {Object} options - Options for processing relations
 * @returns {Object} Resource with included relations
 */
export const includeResourceRelations = (resource, relations, options = {}) => {
	if (!resource || typeof resource !== "object") {
		return resource;
	}

	return includeRelations([resource], relations, options)[0];
};

/**
 * Extract relation parameters from request query
 * This allows clients to request specific relations to include
 *
 * @param {Object} req - Express request object
 * @returns {Object} Relation parameters
 */
export const getRelationParams = (req) => {
	const result = {
		include: [],
		exclude: [],
	};

	if (!req.query._include && !req.query._exclude) {
		return result;
	}

	if (req.query._include) {
		result.include = req.query._include.split(",").map((r) => r.trim());
	}

	if (req.query._exclude) {
		result.exclude = req.query._exclude.split(",").map((r) => r.trim());
	}

	return result;
};

export default {
	includeRelations,
	includeResourceRelations,
	getRelationParams,
};
