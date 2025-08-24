import jwt from "jsonwebtoken";
import { AppError } from "../middlewares/error.middleware.js";

// Token secrets
const accessTokenSecret = process.env.SECRET;
const refreshTokenSecret = process.env.REFRESH_SECRET;

// Token configuration
const accessTokenConfig = {
	expiresIn: "30m", // Access token expires in 30 minutes
};

const refreshTokenConfig = {
	expiresIn: "7d", // Refresh token expires in 7 days
};

/**
 * Generates an access token
 * @param {Object} payload - Data to be included in the token
 * @returns {string} JWT Token
 */
export const generateAccessToken = (payload) => {
	try {
		return jwt.sign(payload, accessTokenSecret, accessTokenConfig);
	} catch (error) {
		throw new AppError("Error generating access token", 500);
	}
};

/**
 * Generates a refresh token
 * @param {Object} payload - Data to be included in the token
 * @returns {string} JWT Refresh Token
 */
export const generateRefreshToken = (payload) => {
	try {
		return jwt.sign(payload, refreshTokenSecret, refreshTokenConfig);
	} catch (error) {
		throw new AppError("Error generating refresh token", 500);
	}
};

/**
 * Verifies an access token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded payload
 */
export const verifyAccessToken = (token) => {
	try {
		return jwt.verify(token, accessTokenSecret);
	} catch (error) {
		if (error.name === "TokenExpiredError") {
			throw new AppError("Token expired", 401);
		}
		throw new AppError("Invalid token", 401);
	}
};

/**
 * Verifies a refresh token
 * @param {string} token - Refresh token to verify
 * @returns {Object} Decoded payload
 */
export const verifyRefreshToken = (token) => {
	try {
		return jwt.verify(token, refreshTokenSecret);
	} catch (error) {
		if (error.name === "TokenExpiredError") {
			throw new AppError("Refresh token expired", 401);
		}
		throw new AppError("Invalid refresh token", 401);
	}
};

/**
 * Generates a pair of tokens (access + refresh)
 * @param {Object} payload - Data to be included in both tokens
 * @returns {Object} Object containing both tokens
 */
export const generateTokenPair = (payload) => {
	const accessToken = generateAccessToken(payload);
	const refreshToken = generateRefreshToken(payload);

	return {
		accessToken,
		refreshToken,
	};
};

/**
 * Extracts token from authorization header
 * @param {string} authHeader - Authorization header
 * @returns {string} Extracted token
 */
export const extractTokenFromHeader = (authHeader) => {
	if (!authHeader?.startsWith("Bearer ")) {
		throw new AppError("No token provided", 401);
	}
	return authHeader.split(" ")[1];
};

export default {
	generateAccessToken,
	generateRefreshToken,
	verifyAccessToken,
	verifyRefreshToken,
	generateTokenPair,
	extractTokenFromHeader,
};
