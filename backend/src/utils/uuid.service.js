import { v4 as uuidv4 } from "uuid";

/**
 * Generate a new UUID
 * @returns {string} Generated UUID
 */
export const generateUUID = () => {
	return uuidv4();
};

/**
 * Validate if a string is a valid UUID
 * @param {string} uuid - String to validate
 * @returns {boolean} True if valid UUID, false otherwise
 */
export const isValidUUID = (uuid) => {
	const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
	return uuidRegex.test(uuid);
};

/**
 * Convert UUID string to binary format for database storage
 * @param {string} uuid - UUID string
 * @returns {Buffer} Binary representation of UUID
 */
export const uuidToBinary = (uuid) => {
	// Remove hyphens and convert to buffer
	return Buffer.from(uuid.replace(/-/g, ""), "hex");
};

/**
 * Convert binary UUID from database to string format
 * @param {Buffer} binary - Binary UUID
 * @returns {string} UUID string
 */
export const binaryToUUID = (binary) => {
	if (!binary) return null;

	// Convert buffer to hex string and add hyphens
	const hex = binary.toString("hex");
	return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};

export default {
	generateUUID,
	isValidUUID,
	uuidToBinary,
	binaryToUUID,
};
