/**
 * SEO Configuration
 * Centralized configuration for SEO meta tags, Open Graph, and Schema.org
 */

export const SEO_CONFIG = {
	// Default meta tags
	defaultTitle: "Asia Experiences | Viajes auténticos por Asia",
	titleTemplate: "%s | Asia Experiences",
	defaultDescription:
		"Descubre experiencias únicas y auténticas en el continente asiático. Viajes personalizados a Japón, Tailandia, Vietnam, India y más destinos asiáticos.",
	defaultKeywords: "viajes asia, experiencias asia, viajes japón, viajes tailandia, turismo asia, agencia viajes asia",

	// Site information
	siteUrl: "https://asiaexperiences.com",
	siteName: "Asia Experiences",
	defaultImage: "/images/og-default.jpg",
	defaultImageAlt: "Asia Experiences - Viajes auténticos por Asia",

	// Social media
	twitterUsername: "@asiaexperiences",
	facebookAppId: "", // To be configured

	// Organization information (Schema.org)
	organization: {
		"@context": "https://schema.org",
		"@type": "TravelAgency",
		name: "Asia Experiences",
		url: "https://asiaexperiences.com",
		logo: "https://asiaexperiences.com/logo.png",
		description: "Agencia de viajes especializada en experiencias auténticas por Asia",
		address: {
			"@type": "PostalAddress",
			streetAddress: "Pasaje Gutiérrez, 6",
			addressLocality: "Valladolid",
			postalCode: "47002",
			addressCountry: "ES",
		},
		contactPoint: {
			"@type": "ContactPoint",
			telephone: "+34-983-303-666",
			contactType: "customer service",
			availableLanguage: ["Spanish", "English"],
			email: "info@asiaexperiences.com",
		},
		sameAs: [
			"https://facebook.com/asiaexperiences",
			"https://instagram.com/asiaexperiences",
			"https://twitter.com/asiaexperiences",
			"https://youtube.com/asiaexperiences",
		],
	},

	// Supported languages
	languages: ["es", "en"],
	defaultLanguage: "es",

	// Robots configuration
	robots: {
		index: true,
		follow: true,
		"max-snippet": -1,
		"max-image-preview": "large",
		"max-video-preview": -1,
	},
};

/**
 * Generate SEO meta tags for a page
 * @param {Object} options - SEO options
 * @returns {Object} Meta tags object
 */
export const generateSEOMeta = (options = {}) => {
	const {
		title,
		description,
		keywords,
		image,
		imageAlt,
		url,
		type = "website",
		author,
		publishedTime,
		modifiedTime,
		noindex = false,
		nofollow = false,
		canonical,
	} = options;

	const metaTags = {
		title: title ? `${title} | ${SEO_CONFIG.siteName}` : SEO_CONFIG.defaultTitle,
		description: description || SEO_CONFIG.defaultDescription,
		keywords: keywords || SEO_CONFIG.defaultKeywords,
		image: image ? `${SEO_CONFIG.siteUrl}${image}` : `${SEO_CONFIG.siteUrl}${SEO_CONFIG.defaultImage}`,
		imageAlt: imageAlt || SEO_CONFIG.defaultImageAlt,
		url: url ? `${SEO_CONFIG.siteUrl}${url}` : SEO_CONFIG.siteUrl,
		canonical: canonical || url,
		robots: {
			index: !noindex,
			follow: !nofollow,
		},
		openGraph: {
			type,
			title: title || SEO_CONFIG.defaultTitle,
			description: description || SEO_CONFIG.defaultDescription,
			url: url ? `${SEO_CONFIG.siteUrl}${url}` : SEO_CONFIG.siteUrl,
			siteName: SEO_CONFIG.siteName,
			image: image ? `${SEO_CONFIG.siteUrl}${image}` : `${SEO_CONFIG.siteUrl}${SEO_CONFIG.defaultImage}`,
		},
		twitter: {
			card: "summary_large_image",
			site: SEO_CONFIG.twitterUsername,
			creator: author || SEO_CONFIG.twitterUsername,
			title: title || SEO_CONFIG.defaultTitle,
			description: description || SEO_CONFIG.defaultDescription,
			image: image ? `${SEO_CONFIG.siteUrl}${image}` : `${SEO_CONFIG.siteUrl}${SEO_CONFIG.defaultImage}`,
		},
	};

	// Add article specific meta tags
	if (type === "article" && (publishedTime || modifiedTime)) {
		metaTags.article = {
			publishedTime,
			modifiedTime,
			author,
		};
	}

	return metaTags;
};

/**
 * Generate breadcrumb schema
 * @param {Array} breadcrumbs - Array of breadcrumb items
 * @returns {Object} Breadcrumb schema
 */
export const generateBreadcrumbSchema = (breadcrumbs) => {
	return {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: breadcrumbs.map((item, index) => ({
			"@type": "ListItem",
			position: index + 1,
			name: item.name,
			item: `${SEO_CONFIG.siteUrl}${item.url}`,
		})),
	};
};

/**
 * Generate FAQ schema
 * @param {Array} faqs - Array of FAQ items
 * @returns {Object} FAQ schema
 */
export const generateFAQSchema = (faqs) => {
	return {
		"@context": "https://schema.org",
		"@type": "FAQPage",
		mainEntity: faqs.map((faq) => ({
			"@type": "Question",
			name: faq.question,
			acceptedAnswer: {
				"@type": "Answer",
				text: faq.answer,
			},
		})),
	};
};

export default SEO_CONFIG;
