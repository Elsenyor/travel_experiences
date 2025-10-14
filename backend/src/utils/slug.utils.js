/**
 * Slug Utilities
 * Functions for generating and validating URL-friendly slugs
 *
 * What is a slug?
 * A slug is a URL-friendly version of a string, typically used in URLs.
 * Example: "Viaje a Japón - 15 días" → "viaje-a-japon-15-dias"
 *
 * Why use slugs?
 * - SEO: Search engines prefer readable URLs
 * - Permanence: URLs don't change when titles change
 * - User-friendly: Easy to read and remember
 */

/**
 * Generate a URL-friendly slug from text
 *
 * Process:
 * 1. Convert to lowercase
 * 2. Normalize accents and special characters
 * 3. Replace spaces and special chars with hyphens
 * 4. Remove duplicate hyphens
 * 5. Trim hyphens from start/end
 *
 * @param {string} text - Text to convert to slug
 * @returns {string} URL-friendly slug
 *
 * @example
 * generateSlug('Viaje a Japón - 15 días')
 * // Returns: 'viaje-a-japon-15-dias'
 *
 * generateSlug('TOUR por BALI!!!')
 * // Returns: 'tour-por-bali'
 */
export const generateSlug = (text) => {
	if (!text) return "";

	return (
		text
			.toLowerCase() // Convert to lowercase
			.normalize("NFD") // Normalize accents
			.replace(/[\u0300-\u036f]/g, "") // Remove accents
			// Replace Spanish special characters
			.replace(/ñ/g, "n")
			.replace(/ü/g, "u")
			// Remove all non-alphanumeric characters except hyphens
			.replace(/[^a-z0-9\s-]/g, "")
			// Replace spaces with hyphens
			.replace(/\s+/g, "-")
			// Replace multiple hyphens with single hyphen
			.replace(/-+/g, "-")
			// Remove leading/trailing hyphens
			.trim()
			.replace(/^-+|-+$/g, "")
			// Limit to 255 characters
			.substring(0, 255)
	);
};

/**
 * Generate a unique slug by checking database
 * If slug exists, appends a number: slug-1, slug-2, etc.
 *
 * @param {string} baseSlug - Base slug to make unique
 * @param {Function} checkExistsFn - Async function that checks if slug exists
 * @param {string} excludeId - ID to exclude from check (for updates)
 * @returns {Promise<string>} Unique slug
 *
 * @example
 * const slug = await generateUniqueSlug(
 *   'viaje-a-japon',
 *   async (slug) => await Trip.findBySlug(slug),
 *   currentTripId
 * );
 */
export const generateUniqueSlug = async (baseSlug, checkExistsFn, excludeId = null) => {
	let slug = baseSlug;
	let counter = 1;
	let exists = true;

	// Keep trying until we find a unique slug
	while (exists) {
		const existing = await checkExistsFn(slug);

		// Slug is unique if:
		// - It doesn't exist, OR
		// - It exists but belongs to the record we're updating
		if (!existing || (excludeId && existing.id === excludeId)) {
			exists = false;
		} else {
			// Slug exists, try with counter
			slug = `${baseSlug}-${counter}`;
			counter++;
		}

		// Safety check: prevent infinite loop
		if (counter > 100) {
			// After 100 attempts, add random suffix
			slug = `${baseSlug}-${Date.now()}`;
			break;
		}
	}

	return slug;
};

/**
 * Validate slug format
 *
 * Rules:
 * - Must contain only lowercase letters, numbers, and hyphens
 * - Cannot start or end with hyphen
 * - Cannot have consecutive hyphens
 * - Must be between 1 and 255 characters
 *
 * @param {string} slug - Slug to validate
 * @returns {boolean} True if valid, false otherwise
 *
 * @example
 * validateSlugFormat('viaje-a-japon') // true
 * validateSlugFormat('Viaje-a-Japon') // false (has uppercase)
 * validateSlugFormat('-viaje-a-japon') // false (starts with hyphen)
 * validateSlugFormat('viaje--japon') // false (consecutive hyphens)
 */
export const validateSlugFormat = (slug) => {
	if (!slug || typeof slug !== "string") return false;
	if (slug.length < 1 || slug.length > 255) return false;

	// Must contain only lowercase letters, numbers, and hyphens
	const validCharsRegex = /^[a-z0-9-]+$/;
	if (!validCharsRegex.test(slug)) return false;

	// Cannot start or end with hyphen
	if (slug.startsWith("-") || slug.endsWith("-")) return false;

	// Cannot have consecutive hyphens
	if (slug.includes("--")) return false;

	return true;
};

/**
 * Sanitize slug (clean and validate)
 * Use this for user-provided slugs
 *
 * @param {string} slug - Slug to sanitize
 * @returns {string|null} Sanitized slug or null if invalid
 *
 * @example
 * sanitizeSlug('Viaje-a-Japón!!!') // Returns: 'viaje-a-japon'
 * sanitizeSlug('---invalid---') // Returns: 'invalid'
 */
export const sanitizeSlug = (slug) => {
	if (!slug) return null;

	// Generate clean slug from input
	const cleaned = generateSlug(slug);

	// Validate the result
	if (!validateSlugFormat(cleaned)) return null;

	return cleaned;
};

/**
 * Get slug from title or use provided slug
 * Priority: custom slug > generated from title
 *
 * @param {string} title - Title to generate slug from
 * @param {string} customSlug - Optional custom slug
 * @returns {string} Final slug to use
 *
 * @example
 * getSlugFromTitle('Viaje a Japón', null)
 * // Returns: 'viaje-a-japon'
 *
 * getSlugFromTitle('Viaje a Japón', 'tour-japon')
 * // Returns: 'tour-japon'
 */
export const getSlugFromTitle = (title, customSlug = null) => {
	// If custom slug provided, use it (sanitized)
	if (customSlug) {
		const sanitized = sanitizeSlug(customSlug);
		if (sanitized) return sanitized;
	}

	// Otherwise, generate from title
	return generateSlug(title);
};

export default {
	generateSlug,
	generateUniqueSlug,
	validateSlugFormat,
	sanitizeSlug,
	getSlugFromTitle,
};

