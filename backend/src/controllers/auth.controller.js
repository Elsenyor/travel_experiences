import bcrypt from "bcrypt";
import * as jwtService from "../utils/jwt.service.js";
import { setRefreshTokenCookie, clearRefreshTokenCookie } from "../utils/cookie.service.js";
import { AppError } from "../middlewares/error.middleware.js";
import dbPool from "../utils/database.pool.js";

/**
 * User registration
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const register = async (req, res, next) => {
	try {
		const { name, email, password } = req.body;

		// Check if user already exists
		const [existingUser] = await dbPool.executeQuery("SELECT id FROM users WHERE email = ?", [email]);

		if (existingUser?.length > 0) {
			throw new AppError("Email already registered", 400);
		}

		// Hash password
		const hashedPassword = await bcrypt.hash(password, 12);

		// Create user
		const [result] = await dbPool.executeQuery("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'user')", [
			name,
			email,
			hashedPassword,
		]);

		// Generate tokens
		const payload = {
			id: result.insertId,
			role: "user",
		};

		const accessToken = jwtService.generateAccessToken(payload);
		const refreshToken = jwtService.generateRefreshToken(payload);

		// Set refresh token in httpOnly cookie
		setRefreshTokenCookie(res, refreshToken);

		// Send response
		res.status(201).json({
			status: "success",
			data: {
				accessToken,
				user: {
					id: result.insertId,
					name,
					email,
					role: "user",
				},
			},
		});
	} catch (error) {
		next(error);
	}
};

/**
 * User login
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const login = async (req, res, next) => {
	try {
		const { email, password } = req.body;

		// Get user
		const [users] = await dbPool.executeQuery("SELECT id, name, email, password, role FROM users WHERE email = ?", [email]);

		const user = users[0];

		// Check if user exists and password is correct
		if (!user || !(await bcrypt.compare(password, user.password))) {
			throw new AppError("Invalid email or password", 401);
		}

		// Generate tokens
		const payload = {
			id: user.id,
			role: user.role,
		};

		const accessToken = jwtService.generateAccessToken(payload);
		const refreshToken = jwtService.generateRefreshToken(payload);

		// Set refresh token in httpOnly cookie
		setRefreshTokenCookie(res, refreshToken);

		// Remove password from response
		delete user.password;

		// Send response
		res.json({
			status: "success",
			data: {
				accessToken,
				user,
			},
		});
	} catch (error) {
		next(error);
	}
};

/**
 * Get current user profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const getProfile = async (req, res, next) => {
	try {
		const [users] = await dbPool.executeQuery("SELECT id, name, email, role FROM users WHERE id = ?", [req.user.id]);

		if (!users[0]) {
			throw new AppError("User not found", 404);
		}

		res.json({
			status: "success",
			data: {
				user: users[0],
			},
		});
	} catch (error) {
		next(error);
	}
};

/**
 * Logout user
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
	register,
	login,
	getProfile,
	logout,
};
