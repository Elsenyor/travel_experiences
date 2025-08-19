/**
 * Cookie configuration service
 * Handles cookie settings and security configurations
 */

export const cookieConfig = {
	// Security settings for cookies
	refreshToken: {
		httpOnly: true, // Prevents JavaScript access
		secure: process.env.NODE_ENV === "production", // HTTPS only in production
		sameSite: "strict", // Protects against CSRF
		maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
		path: "/api/v1/auth", // Cookie only accessible in auth routes
	},

	// Settings for removing cookies
	clearCookie: {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "strict",
		path: "/api/v1/auth",
	},
};

/**
 * Sets refresh token in HTTP only cookie
 * @param {Object} res - Express response object
 * @param {string} token - Refresh token to store
 */
export const setRefreshTokenCookie = (res, token) => {
	res.cookie("refreshToken", token, cookieConfig.refreshToken);
};

/**
 * Clears refresh token cookie
 * @param {Object} res - Express response object
 */
export const clearRefreshTokenCookie = (res) => {
	res.clearCookie("refreshToken", cookieConfig.clearCookie);
};
