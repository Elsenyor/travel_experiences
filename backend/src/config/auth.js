import dotenv from "dotenv";

dotenv.config();

export const authConfig = {
	jwt: {
		secret: process.env.SECRET,
		expiresIn: process.env.JWT_EXPIRES_IN || "24h",
	},
	roles: {
		ADMIN: "admin",
		USER: "user",
	},
};

export default authConfig;
