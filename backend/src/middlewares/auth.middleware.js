import jwt from "jsonwebtoken";
import { AppError } from "./error.middleware.js";
import { verifyToken } from "../utils/jwt.service.js";
import { isValidUUID } from "../utils/uuid.service.js";

/**
 * Middleware to authenticate token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const authenticateToken = (req, res, next) => {
	try {
		// Get token from Authorization header or cookie
		const authHeader = req.headers["authorization"];
		const token = authHeader?.split(" ")[1] || req.cookies?.token;

		if (!token) {
			throw new AppError("Authentication required", 401);
		}

		// Verify token
		const decoded = verifyToken(token);

		// Validate user ID is a valid UUID
		if (!isValidUUID(decoded.userId)) {
			throw new AppError("Invalid user ID format", 401);
		}

		// Set user info in request
		req.user = {
			id: decoded.userId,
			email: decoded.email,
			role: decoded.role,
		};

		next();
	} catch (error) {
		if (error instanceof jwt.JsonWebTokenError) {
			next(new AppError("Invalid or expired token", 401));
		} else {
			next(error);
		}
	}
};

/**
 * Middleware to check user role
 * @param {string|Array} roles - Required role(s)
 * @returns {Function} Middleware function
 */
export const checkRole = (roles) => {
	// Convert single role to array
	const allowedRoles = Array.isArray(roles) ? roles : [roles];

	return (req, res, next) => {
		// Check if user exists and has required role
		if (!req.user) {
			return next(new AppError("Authentication required", 401));
		}

		if (!allowedRoles.includes(req.user.role)) {
			return next(new AppError("Insufficient permissions", 403));
		}

		next();
	};
};

export default {
	authenticateToken,
	checkRole,
};
