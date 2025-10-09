/**
 * SEO Controller
 * Handles SEO-related endpoints like sitemap and robots.txt
 */

import { generateSitemap, generateSitemapIndex, generateTripsSitemap, generateArticlesSitemap } from "../utils/sitemap.generator.js";

/**
 * Get base URL from request
 * @param {Object} req - Express request object
 * @returns {string} Base URL
 */
const getBaseUrl = (req) => {
	// Use environment variable if available, otherwise construct from request
	if (process.env.BASE_URL) {
		return process.env.BASE_URL;
	}

	const protocol = req.protocol;
	const host = req.get("host");
	return `${protocol}://${host}`;
};

/**
 * Serve main sitemap.xml
 * GET /sitemap.xml
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const getSitemap = async (req, res, next) => {
	try {
		const baseUrl = getBaseUrl(req);

		// Generate sitemap
		const sitemap = await generateSitemap(baseUrl, {
			languages: ["es", "en"],
		});

		// Set appropriate headers
		res.set("Content-Type", "application/xml");
		res.set("Cache-Control", "public, max-age=3600"); // Cache for 1 hour

		res.send(sitemap);
	} catch (error) {
		console.error("Error generating sitemap:", error);
		next(error);
	}
};

/**
 * Serve sitemap index (for large sites)
 * GET /sitemap-index.xml
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const getSitemapIndex = async (req, res, next) => {
	try {
		const baseUrl = getBaseUrl(req);
		const sitemapIndex = generateSitemapIndex(baseUrl);

		res.set("Content-Type", "application/xml");
		res.set("Cache-Control", "public, max-age=3600");

		res.send(sitemapIndex);
	} catch (error) {
		console.error("Error generating sitemap index:", error);
		next(error);
	}
};

/**
 * Serve trips sitemap
 * GET /sitemap-trips.xml
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const getTripsSitemap = async (req, res, next) => {
	try {
		const baseUrl = getBaseUrl(req);
		const sitemap = await generateTripsSitemap(baseUrl);

		res.set("Content-Type", "application/xml");
		res.set("Cache-Control", "public, max-age=3600");

		res.send(sitemap);
	} catch (error) {
		console.error("Error generating trips sitemap:", error);
		next(error);
	}
};

/**
 * Serve articles sitemap
 * GET /sitemap-articles.xml
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const getArticlesSitemap = async (req, res, next) => {
	try {
		const baseUrl = getBaseUrl(req);
		const sitemap = await generateArticlesSitemap(baseUrl);

		res.set("Content-Type", "application/xml");
		res.set("Cache-Control", "public, max-age=3600");

		res.send(sitemap);
	} catch (error) {
		console.error("Error generating articles sitemap:", error);
		next(error);
	}
};

/**
 * Serve robots.txt
 * GET /robots.txt
 *
 * Robots.txt tells search engines which pages they can and cannot crawl
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getRobotsTxt = (req, res) => {
	const baseUrl = getBaseUrl(req);

	// Generate robots.txt content dynamically
	const robotsTxt = `# Robots.txt for Asia Experiences
# This file tells search engines which pages to crawl and which to avoid

# Allow all crawlers to access public content
User-agent: *
Allow: /

# Block access to admin and API routes
Disallow: /api/
Disallow: /admin/
Disallow: /auth/

# Block access to user-specific pages
Disallow: /user/
Disallow: /profile/

# Block search and filter pages with parameters (to avoid duplicate content)
Disallow: /*?*sort=
Disallow: /*?*filter=

# Allow access to static assets
Allow: /assets/
Allow: /images/
Allow: /*.css$
Allow: /*.js$

# Sitemap location
Sitemap: ${baseUrl}/sitemap.xml

# Crawl delay (optional, time in seconds between requests)
# Crawl-delay: 1

# Specific rules for different crawlers (optional)
# User-agent: Googlebot
# Crawl-delay: 0

# User-agent: Bingbot
# Crawl-delay: 1
`;

	// Set appropriate headers
	res.set("Content-Type", "text/plain");
	res.set("Cache-Control", "public, max-age=86400"); // Cache for 24 hours

	res.send(robotsTxt);
};

export default {
	getSitemap,
	getSitemapIndex,
	getTripsSitemap,
	getArticlesSitemap,
	getRobotsTxt,
};
