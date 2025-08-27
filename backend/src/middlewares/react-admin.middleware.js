/**
 * Middleware for handling React Admin query parameters
 * This middleware transforms React Admin specific query parameters into a format
 * that our API can understand and process.
 *
 * React Admin sends the following parameters:
 * - _sort: field to sort by
 * - _order: sort order (ASC or DESC)
 * - _start: offset for pagination
 * - _end: limit for pagination
 * - _filters: JSON string with filter criteria
 * - q: global search term
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const handleReactAdminParams = (req, res, next) => {
	// Create a params object that will be attached to the request
	req.reactAdminParams = {};

	// Handle pagination parameters
	if (req.query._start !== undefined && req.query._end !== undefined) {
		const start = parseInt(req.query._start, 10) || 0;
		const end = parseInt(req.query._end, 10) || 10;

		req.reactAdminParams.pagination = {
			offset: start,
			limit: end - start,
		};

		// Store original values for Content-Range header
		req.reactAdminParams._start = start;
		req.reactAdminParams._end = end;
	} else if (req.query._page !== undefined && req.query._perPage !== undefined) {
		// Alternative pagination format
		const page = parseInt(req.query._page, 10) || 1;
		const perPage = parseInt(req.query._perPage, 10) || 10;

		req.reactAdminParams.pagination = {
			offset: (page - 1) * perPage,
			limit: perPage,
		};

		// Store original values for Content-Range header
		req.reactAdminParams._start = (page - 1) * perPage;
		req.reactAdminParams._end = page * perPage;
	} else {
		// Default pagination
		req.reactAdminParams.pagination = {
			offset: 0,
			limit: 10,
		};

		req.reactAdminParams._start = 0;
		req.reactAdminParams._end = 10;
	}

	// Handle sorting parameters
	if (req.query._sort && req.query._order) {
		req.reactAdminParams.sort = {
			field: req.query._sort,
			order: req.query._order.toUpperCase(),
		};
	}

	// Handle filtering
	req.reactAdminParams.filters = {};

	// Process JSON filter if present
	if (req.query._filter) {
		try {
			const filters = JSON.parse(req.query._filter);
			req.reactAdminParams.filters = { ...filters };
		} catch (error) {
			console.error("Error parsing _filter parameter:", error);
		}
	}

	// Process individual filter parameters
	Object.keys(req.query).forEach((key) => {
		// Skip React Admin specific parameters
		if (!key.startsWith("_") && key !== "q") {
			req.reactAdminParams.filters[key] = req.query[key];
		}
	});

	// Handle global search term
	if (req.query.q) {
		req.reactAdminParams.search = req.query.q;
	}

	// Handle relation parameters
	req.reactAdminParams.relations = {
		include: [],
		exclude: [],
	};

	// Process _include parameter for relations to include
	if (req.query._include) {
		req.reactAdminParams.relations.include = req.query._include.split(",").map((r) => r.trim());
	}

	// Process _exclude parameter for relations to exclude
	if (req.query._exclude) {
		req.reactAdminParams.relations.exclude = req.query._exclude.split(",").map((r) => r.trim());
	}

	// Store the resource name for Content-Range header
	const url = req.originalUrl || req.url;
	const urlParts = url.split("/");
	req.reactAdminParams.resource = urlParts[urlParts.length - 1].split("?")[0];

	next();
};

/**
 * Helper function to add Content-Range header to response
 * This is required by React Admin for proper pagination
 *
 * @param {Object} res - Express response object
 * @param {string} resource - Resource name (e.g., 'users', 'posts')
 * @param {number} start - Start index
 * @param {number} end - End index
 * @param {number} total - Total count of resources
 */
export const addContentRangeHeader = (res, resource, start, end, total) => {
	res.set("Content-Range", `${resource} ${start}-${Math.min(end, total)}/${total}`);
	res.set("Access-Control-Expose-Headers", "Content-Range");
};

/**
 * Apply filters, sorting, and pagination to a query based on React Admin parameters
 * This is a helper function to be used in controllers
 *
 * @param {Object} query - Base query object
 * @param {Object} reactAdminParams - React Admin parameters
 * @returns {Object} Modified query with filters, sorting, and pagination
 */
export const applyReactAdminParams = (query, reactAdminParams) => {
	const { filters, sort, pagination, search } = reactAdminParams;
	let modifiedQuery = { ...query };

	// Apply filters
	if (filters && Object.keys(filters).length > 0) {
		Object.keys(filters).forEach((key) => {
			// Handle different filter types based on value
			const value = filters[key];

			if (Array.isArray(value)) {
				// Handle array values (IN operator)
				modifiedQuery[key] = { $in: value };
			} else if (typeof value === "object" && value !== null) {
				// Handle range filters or complex operators
				modifiedQuery[key] = value;
			} else {
				// Simple equality
				modifiedQuery[key] = value;
			}
		});
	}

	// Apply global search if specified
	if (search) {
		// This is just a placeholder - actual implementation will depend on your database
		// and how you want to handle global search
		modifiedQuery.$search = search;
	}

	// Return the modified query
	return {
		query: modifiedQuery,
		sort: sort || { field: "id", order: "ASC" },
		pagination: pagination || { offset: 0, limit: 10 },
	};
};

export default {
	handleReactAdminParams,
	addContentRangeHeader,
	applyReactAdminParams,
};
