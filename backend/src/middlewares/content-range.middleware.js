/**
 * Middleware for adding Content-Range header to responses
 * This is required by React Admin for proper pagination
 *
 * The Content-Range header format is:
 * Content-Range: <resource> <start>-<end>/<total>
 *
 * Example: Content-Range: users 0-9/27
 */

/**
 * Add Content-Range header to the response based on the count and reactAdminParams
 * This middleware should be used after the data is fetched and count is available
 *
 * @param {string} resource - Resource name (e.g., 'users', 'trips')
 * @returns {Function} Express middleware function
 */
export const addContentRange = (resource) => {
	return (req, res, next) => {
		// Store the original end function to intercept it
		const originalEnd = res.end;

		// Override the end function
		res.end = function (chunk, encoding) {
			// Only process JSON responses
			if (res.getHeader("Content-Type")?.includes("application/json")) {
				try {
					// Get the data from the response
					const body = chunk ? JSON.parse(chunk) : null;

					// If we have data and it's an array (list response)
					if (body && Array.isArray(body.data)) {
						// Get pagination parameters from reactAdminParams or use defaults
						const start = req.reactAdminParams?._start || 0;
						const limit = req.reactAdminParams?.pagination?.limit || 10;
						const total = body.total || body.data.length;
						const end = Math.min(start + limit, total);

						// Set the Content-Range header
						res.setHeader("Content-Range", `${resource} ${start}-${end}/${total}`);
						res.setHeader("Access-Control-Expose-Headers", "Content-Range");
					}
				} catch (error) {
					console.error("Error setting Content-Range header:", error);
				}
			}

			// Call the original end function
			return originalEnd.call(this, chunk, encoding);
		};

		next();
	};
};

/**
 * Middleware to add Content-Range header to a specific response
 * This should be used in controllers when you have the total count
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {number} total - Total count of resources
 */
export const setContentRange = (req, res, total) => {
	if (!req.reactAdminParams) {
		return;
	}

	const resource = req.reactAdminParams.resource;
	const start = req.reactAdminParams._start || 0;
	const end = Math.min(req.reactAdminParams._end || start + 10, total);

	res.setHeader("Content-Range", `${resource} ${start}-${end}/${total}`);
	res.setHeader("Access-Control-Expose-Headers", "Content-Range");
};

/**
 * Format response for React Admin list views
 * This function formats the response to include pagination metadata
 *
 * @param {Array} data - Array of resources
 * @param {number} total - Total count of resources
 * @returns {Object} Formatted response object
 */
export const formatListResponse = (data, total) => {
	return {
		data,
		total,
	};
};

/**
 * Format response for React Admin get one view
 *
 * @param {Object} data - Resource data
 * @returns {Object} Formatted response object
 */
export const formatGetOneResponse = (data) => {
	return {
		data,
	};
};

export default {
	addContentRange,
	setContentRange,
	formatListResponse,
	formatGetOneResponse,
};
