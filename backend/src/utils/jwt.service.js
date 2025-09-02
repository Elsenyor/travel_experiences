import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { isValidUUID } from "./uuid.service.js";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "your-refresh-secret-key";
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

/**
 * Generate JWT token
 * @param {Object} payload - Token payload
 * @param {string} payload.userId - User ID (UUID)
 * @param {string} payload.email - User email
 * @param {string} payload.role - User role
 * @returns {string} JWT token
 */
export const generateToken = (payload) => {
	// Validate that userId is a valid UUID
	if (!isValidUUID(payload.userId)) {
		throw new Error("Invalid user ID format");
	}

	return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * Generate refresh token
 * @param {Object} payload - Token payload
 * @param {string} payload.userId - User ID (UUID)
 * @returns {string} Refresh token
 */
export const generateRefreshToken = (payload) => {
	// Validate that userId is a valid UUID
	if (!isValidUUID(payload.userId)) {
		throw new Error("Invalid user ID format");
	}

	return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });
};

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @returns {Object} Decoded token payload
 */
export const verifyToken = (token) => {
	return jwt.verify(token, JWT_SECRET);
};

/**
 * Verify refresh token
 * @param {string} token - Refresh token
 * @returns {Object} Decoded token payload
 */
export const verifyRefreshToken = (token) => {
	return jwt.verify(token, JWT_REFRESH_SECRET);
};

export default {
	generateToken,
	generateRefreshToken,
	verifyToken,
	verifyRefreshToken,
};
