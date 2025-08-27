import * as jwtService from "../utils/jwt.service.js";
import { setRefreshTokenCookie, clearRefreshTokenCookie } from "../utils/cookie.service.js";
import { AppError } from "./error.middleware.js";

/**
 * Middleware to verify JWT token and add user to request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const authenticateToken = async (req, res, next) => {
	try {
		const authHeader = req.headers.authorization;
		const token = jwtService.extractTokenFromHeader(authHeader);
		const payload = jwtService.verifyAccessToken(token);

		// Add user data to request for use in subsequent middlewares/controllers
		req.user = payload;
		next();
	} catch (error) {
		next(new AppError(error.message, 401));
	}
};

/**
 * Middleware to check if user has required role
 * @param {string} role - Required role
 */
export const checkRole = (role) => {
	return (req, res, next) => {
		if (!req.user) {
			return next(new AppError("User not authenticated", 401));
		}

		if (req.user.role !== role) {
			return next(new AppError("Not authorized to access this route", 403));
		}

		next();
	};
};

/**
 * Middleware to check if user has one of the required roles
 * @param {string[]} roles - Array of allowed roles
 */
export const authorizeRoles = (...roles) => {
	return (req, res, next) => {
		if (!req.user) {
			return next(new AppError("User not authenticated", 401));
		}

		if (!roles.includes(req.user.role)) {
			return next(new AppError("Not authorized to access this route", 403));
		}

		next();
	};
};

/**
 * Middleware to check if user owns the resource or is admin
 * @param {string} paramId - Name of the parameter containing the resource ID
 * @param {Function} getResourceOwner - Function to get resource owner ID
 */
export const authorizeOwnership = (paramId, getResourceOwner) => {
	return async (req, res, next) => {
		try {
			if (!req.user) {
				return next(new AppError("User not authenticated", 401));
			}

			// Admins can access any resource
			if (req.user.role === "admin") {
				return next();
			}

			const resourceId = req.params[paramId];
			if (!resourceId) {
				return next(new AppError("Resource ID not provided", 400));
			}

			const ownerId = await getResourceOwner(resourceId);
			if (ownerId !== req.user.id) {
				return next(new AppError("Not authorized to access this resource", 403));
			}

			next();
		} catch (error) {
			next(error);
		}
	};
};

/**
 * Middleware to refresh access token using refresh token from httpOnly cookie
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const refreshAccessToken = async (req, res, next) => {
	try {
		// Get refresh token from httpOnly cookie
		const refreshToken = req.cookies.refreshToken;
		if (!refreshToken) {
			throw new AppError("Refresh token not provided", 400);
		}

		// Verify refresh token and generate new access token
		const payload = jwtService.verifyRefreshToken(refreshToken);
		const newRefreshToken = jwtService.generateRefreshToken({
			id: payload.id,
			role: payload.role,
		});
		const accessToken = jwtService.generateAccessToken({
			id: payload.id,
			role: payload.role,
		});

		// Set new refresh token in httpOnly cookie
		setRefreshTokenCookie(res, newRefreshToken);

		// Send new access token in response
		res.json({
			status: "success",
			data: { accessToken },
		});
	} catch (error) {
		clearRefreshTokenCookie(res);
		next(new AppError("Invalid refresh token", 401));
	}
};

/**
 * Middleware to handle logout by clearing refresh token cookie
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const logout = (req, res) => {
	clearRefreshTokenCookie(res);
	res.json({
		status: "success",
		message: "Logged out successfully",
	});
};

export default {
	authenticateToken,
	checkRole,
	authorizeRoles,
	authorizeOwnership,
	refreshAccessToken,
	logout,
};
