import { OAuth2Client } from "google-auth-library";
import dotenv from "dotenv";

dotenv.config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_REDIRECT_URI);

class GoogleService {
	/**
	 * Generate Google OAuth URL
	 * @returns {string} Google OAuth URL
	 */
	static generateAuthUrl() {
		return client.generateAuthUrl({
			access_type: "offline",
			scope: ["https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/userinfo.email"],
			prompt: "consent",
		});
	}

	/**
	 * Get user profile from Google
	 * @param {string} code - Authorization code from Google
	 * @returns {Promise<Object>} User profile data
	 */
	static async getProfileFromCode(code) {
		try {
			// Get tokens from code
			const { tokens } = await client.getToken(code);
			client.setCredentials(tokens);

			// Get user profile
			const { data } = await client.request({
				url: "https://www.googleapis.com/oauth2/v3/userinfo",
			});

			return {
				google_id: data.sub,
				email: data.email,
				name: data.given_name,
				surname: data.family_name,
				avatar_url: data.picture,
				email_verified: data.email_verified,
			};
		} catch (error) {
			throw new Error(`Error getting Google profile: ${error.message}`);
		}
	}

	/**
	 * Verify Google ID token
	 * @param {string} token - Google ID token
	 * @returns {Promise<Object>} Verified token payload
	 */
	static async verifyToken(token) {
		try {
			const ticket = await client.verifyIdToken({
				idToken: token,
				audience: process.env.GOOGLE_CLIENT_ID,
			});
			return ticket.getPayload();
		} catch (error) {
			throw new Error(`Error verifying Google token: ${error.message}`);
		}
	}
}

export default GoogleService;
