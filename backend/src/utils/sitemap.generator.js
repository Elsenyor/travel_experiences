/**
 * Sitemap Generator Utility
 * Generates dynamic XML sitemaps for search engines
 *
 * Purpose:
 * - Helps search engines discover and index all pages on the website
 * - Provides metadata about pages (last modification date, change frequency, priority)
 * - Improves SEO by ensuring all important pages are crawled
 *
 * XML Sitemap Protocol: https://www.sitemaps.org/protocol.html
 */

import tripModel from "../models/trip.model.js";
import articlesModel from "../models/articles.model.js";

/**
 * Format date for sitemap (W3C Datetime format)
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date (YYYY-MM-DD)
 */
const formatDate = (date) => {
	if (!date) return new Date().toISOString().split("T")[0];
	const d = new Date(date);
	return d.toISOString().split("T")[0];
};

/**
 * Escape XML special characters
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
const escapeXml = (str) => {
	if (!str) return "";
	return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
};

/**
 * Generate slug from title if not provided
 * Converts text to URL-friendly format
 * @param {string} text - Text to convert
 * @returns {string} URL-friendly slug
 */
export const generateSlug = (text) => {
	if (!text) return "";
	return text
		.toLowerCase()
		.normalize("NFD") // Normalize accents
		.replace(/[\u0300-\u036f]/g, "") // Remove accents
		.replace(/[^a-z0-9\s-]/g, "") // Remove special characters
		.trim()
		.replace(/\s+/g, "-") // Replace spaces with hyphens
		.replace(/-+/g, "-"); // Remove duplicate hyphens
};

/**
 * Create URL entry for sitemap
 * @param {Object} options - URL options
 * @param {string} options.loc - URL location
 * @param {string} options.lastmod - Last modification date
 * @param {string} options.changefreq - Change frequency
 * @param {number} options.priority - Priority (0.0 to 1.0)
 * @returns {string} XML URL entry
 */
const createUrlEntry = ({ loc, lastmod, changefreq, priority }) => {
	return `
  <url>
    <loc>${escapeXml(loc)}</loc>
    ${lastmod ? `<lastmod>${formatDate(lastmod)}</lastmod>` : ""}
    ${changefreq ? `<changefreq>${changefreq}</changefreq>` : ""}
    ${priority ? `<priority>${priority}</priority>` : ""}
  </url>`;
};

/**
 * Generate sitemap for static pages
 * @param {string} baseUrl - Base URL of the website
 * @returns {Array} Array of URL entries
 */
const generateStaticPages = (baseUrl) => {
	const staticPages = [
		{
			loc: `${baseUrl}/`,
			changefreq: "daily",
			priority: 1.0,
		},
		{
			loc: `${baseUrl}/trips`,
			changefreq: "daily",
			priority: 0.9,
		},
		{
			loc: `${baseUrl}/blog`,
			changefreq: "daily",
			priority: 0.8,
		},
		{
			loc: `${baseUrl}/about`,
			changefreq: "monthly",
			priority: 0.6,
		},
		{
			loc: `${baseUrl}/contact`,
			changefreq: "monthly",
			priority: 0.6,
		},
		{
			loc: `${baseUrl}/faq`,
			changefreq: "weekly",
			priority: 0.7,
		},
	];

	return staticPages.map((page) => createUrlEntry(page));
};

/**
 * Generate sitemap entries for trips
 * @param {string} baseUrl - Base URL of the website
 * @param {string} language - Language code
 * @returns {Promise<Array>} Array of URL entries
 */
const generateTripsUrls = async (baseUrl, language = "es") => {
	try {
		// Get all trips with basic info
		const trips = await tripModel.findByFilters({
			language,
			limit: 1000, // Get all trips
			offset: 0,
		});

		return trips.map((trip) => {
			// Generate slug from title or use ID as fallback
			const slug = generateSlug(trip.title) || `trip-${trip.id}`;

			return createUrlEntry({
				loc: `${baseUrl}/${language}/trips/${slug}`,
				lastmod: trip.updated_at || trip.created_at,
				changefreq: "weekly",
				priority: trip.featured ? 0.9 : 0.8,
			});
		});
	} catch (error) {
		console.error("Error generating trips URLs:", error);
		return [];
	}
};

/**
 * Generate sitemap entries for blog articles
 * @param {string} baseUrl - Base URL of the website
 * @param {string} language - Language code
 * @returns {Promise<Array>} Array of URL entries
 */
const generateArticlesUrls = async (baseUrl, language = "es") => {
	try {
		// Get all articles with basic info
		const articles = await articlesModel.findByFilters({
			language,
			limit: 1000, // Get all articles
			offset: 0,
		});

		return articles.map((article) => {
			// Generate slug from title or use ID as fallback
			const slug = generateSlug(article.title) || `article-${article.id}`;

			return createUrlEntry({
				loc: `${baseUrl}/${language}/blog/${slug}`,
				lastmod: article.updated_at || article.created_at,
				changefreq: "weekly",
				priority: 0.7,
			});
		});
	} catch (error) {
		console.error("Error generating articles URLs:", error);
		return [];
	}
};

/**
 * Generate complete sitemap XML
 * @param {string} baseUrl - Base URL of the website (e.g., 'https://asiaexperiences.com')
 * @param {Object} options - Sitemap options
 * @param {Array<string>} options.languages - Array of language codes
 * @returns {Promise<string>} Complete sitemap XML
 */
export const generateSitemap = async (baseUrl, options = {}) => {
	const { languages = ["es", "en"] } = options;

	try {
		// Start XML with declaration and urlset
		let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
		xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"';
		xml += ' xmlns:xhtml="http://www.w3.org/1999/xhtml">';

		// Generate static pages (only for default language)
		const staticUrls = generateStaticPages(baseUrl);
		xml += staticUrls.join("");

		// Generate URLs for each language
		for (const lang of languages) {
			// Generate trips URLs
			const tripsUrls = await generateTripsUrls(baseUrl, lang);
			xml += tripsUrls.join("");

			// Generate articles URLs
			const articlesUrls = await generateArticlesUrls(baseUrl, lang);
			xml += articlesUrls.join("");
		}

		// Close urlset
		xml += "\n</urlset>";

		return xml;
	} catch (error) {
		console.error("Error generating sitemap:", error);
		throw new Error("Failed to generate sitemap");
	}
};

/**
 * Generate sitemap index (for large sites with multiple sitemaps)
 * @param {string} baseUrl - Base URL of the website
 * @returns {string} Sitemap index XML
 */
export const generateSitemapIndex = (baseUrl) => {
	const lastmod = formatDate(new Date());

	let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
	xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

	// Main sitemap
	xml += `  <sitemap>
    <loc>${baseUrl}/sitemap-main.xml</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>\n`;

	// Trips sitemap
	xml += `  <sitemap>
    <loc>${baseUrl}/sitemap-trips.xml</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>\n`;

	// Articles sitemap
	xml += `  <sitemap>
    <loc>${baseUrl}/sitemap-articles.xml</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>\n`;

	xml += "</sitemapindex>";

	return xml;
};

/**
 * Generate trips-only sitemap
 * @param {string} baseUrl - Base URL of the website
 * @returns {Promise<string>} Trips sitemap XML
 */
export const generateTripsSitemap = async (baseUrl) => {
	let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
	xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

	const languages = ["es", "en"];
	for (const lang of languages) {
		const tripsUrls = await generateTripsUrls(baseUrl, lang);
		xml += tripsUrls.join("");
	}

	xml += "\n</urlset>";
	return xml;
};

/**
 * Generate articles-only sitemap
 * @param {string} baseUrl - Base URL of the website
 * @returns {Promise<string>} Articles sitemap XML
 */
export const generateArticlesSitemap = async (baseUrl) => {
	let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
	xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

	const languages = ["es", "en"];
	for (const lang of languages) {
		const articlesUrls = await generateArticlesUrls(baseUrl, lang);
		xml += articlesUrls.join("");
	}

	xml += "\n</urlset>";
	return xml;
};

export default {
	generateSitemap,
	generateSitemapIndex,
	generateTripsSitemap,
	generateArticlesSitemap,
	generateSlug,
};
