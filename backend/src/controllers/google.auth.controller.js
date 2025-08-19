import GoogleService from "../services/google.service.js";
import JWTService from "../utils/jwt.service.js";
import { setRefreshTokenCookie } from "../utils/cookie.service.js";
import { AppError } from "../middlewares/error.middleware.js";
import dbPool from "../utils/database.pool.js";

class GoogleAuthController {
	/**
	 * Get Google OAuth URL
	 * @param {Object} req - Express request object
	 * @param {Object} res - Express response object
	 */
	static async getAuthUrl(req, res) {
		const url = GoogleService.generateAuthUrl();
		res.json({ url });
	}

	/**
	 * Handle Google OAuth callback
	 * @param {Object} req - Express request object
	 * @param {Object} res - Express response object
	 * @param {Function} next - Express next function
	 */
	static async handleCallback(req, res, next) {
		try {
			const { code } = req.query;
			if (!code) {
				throw new AppError("Authorization code not provided", 400);
			}

			// Get user profile from Google
			const googleProfile = await GoogleService.getProfileFromCode(code);

			// Find or create user
			const user = await GoogleAuthController.findOrCreateUser(googleProfile);

			// Generate tokens
			const payload = {
				id: user.id,
				role: user.role,
			};

			const accessToken = JWTService.generateAccessToken(payload);
			const refreshToken = JWTService.generateRefreshToken(payload);

			// Set refresh token cookie
			setRefreshTokenCookie(res, refreshToken);

			// Redirect to frontend with access token
			res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${accessToken}`);
		} catch (error) {
			next(error);
		}
	}

	/**
	 * Find existing user or create new one from Google profile
	 * @param {Object} profile - Google user profile
	 * @returns {Promise<Object>} User object
	 */
	static async findOrCreateUser(profile) {
		const connection = await dbPool.pool.getConnection();
		try {
			await connection.beginTransaction();

			// Check if user exists by Google ID
			let [users] = await connection.query("SELECT * FROM users WHERE google_id = ?", [profile.google_id]);

			if (users.length === 0) {
				// Check if email exists
				[users] = await connection.query("SELECT * FROM users WHERE email = ?", [profile.email]);

				if (users.length > 0) {
					// Update existing user with Google info
					await connection.query(
						`UPDATE users 
                         SET google_id = ?, auth_provider = 'google', avatar_url = ?
                         WHERE email = ?`,
						[profile.google_id, profile.avatar_url, profile.email]
					);
				} else {
					// Create new user
					const [result] = await connection.query(
						`INSERT INTO users (name, surname, email, google_id, avatar_url, auth_provider, role)
                         VALUES (?, ?, ?, ?, ?, 'google', 'user')`,
						[profile.name, profile.surname, profile.email, profile.google_id, profile.avatar_url]
					);
					users = [{ id: result.insertId, role: "user" }];
				}
			}

			await connection.commit();
			return users[0];
		} catch (error) {
			await connection.rollback();
			throw error;
		} finally {
			connection.release();
		}
	}
}

export default GoogleAuthController;
