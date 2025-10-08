import { Helmet } from "react-helmet-async";
import { SEO_CONFIG } from "../../config/seo.config";

/**
 * Organization Schema Component
 * Renders Organization schema for the homepage
 */
export const OrganizationSchema = () => (
	<Helmet>
		<script type="application/ld+json">{JSON.stringify(SEO_CONFIG.organization)}</script>
	</Helmet>
);

/**
 * WebSite Schema Component
 * Renders WebSite schema with search functionality
 */
export const WebSiteSchema = () => {
	const schema = {
		"@context": "https://schema.org",
		"@type": "WebSite",
		name: SEO_CONFIG.siteName,
		url: SEO_CONFIG.siteUrl,
		potentialAction: {
			"@type": "SearchAction",
			target: {
				"@type": "EntryPoint",
				urlTemplate: `${SEO_CONFIG.siteUrl}/search?q={search_term_string}`,
			},
			"query-input": "required name=search_term_string",
		},
	};

	return (
		<Helmet>
			<script type="application/ld+json">{JSON.stringify(schema)}</script>
		</Helmet>
	);
};

/**
 * Trip Schema Component
 * Renders TouristTrip schema for trip detail pages
 * @param {Object} trip - Trip data
 */
export const TripSchema = ({ trip }) => {
	const schema = {
		"@context": "https://schema.org",
		"@type": "TouristTrip",
		name: trip.title,
		description: trip.description,
		image: trip.main_image ? `${SEO_CONFIG.siteUrl}${trip.main_image}` : null,
		url: `${SEO_CONFIG.siteUrl}/trips/${trip.slug}`,
		touristType: "Viajeros culturales, aventureros",
		itinerary: trip.itinerary
			? {
					"@type": "ItemList",
					itemListElement: trip.itinerary.map((day, index) => ({
						"@type": "ListItem",
						position: index + 1,
						item: {
							"@type": "TouristDestination",
							name: day.title,
							description: day.description,
						},
					})),
			  }
			: undefined,
		offers: {
			"@type": "Offer",
			price: trip.price,
			priceCurrency: "EUR",
			availability: trip.available_spots > 0 ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
			validFrom: trip.start_date,
			url: `${SEO_CONFIG.siteUrl}/trips/${trip.slug}`,
		},
		provider: {
			"@type": "TravelAgency",
			name: SEO_CONFIG.organization.name,
			url: SEO_CONFIG.organization.url,
		},
	};

	return (
		<Helmet>
			<script type="application/ld+json">{JSON.stringify(schema)}</script>
		</Helmet>
	);
};

/**
 * Article Schema Component
 * Renders BlogPosting schema for blog articles
 * @param {Object} article - Article data
 * @param {Object} author - Author data
 */
export const ArticleSchema = ({ article, author }) => {
	const schema = {
		"@context": "https://schema.org",
		"@type": "BlogPosting",
		headline: article.title,
		description: article.excerpt || article.description,
		image: article.featured_image ? `${SEO_CONFIG.siteUrl}${article.featured_image}` : null,
		datePublished: article.published_at,
		dateModified: article.updated_at || article.published_at,
		author: {
			"@type": "Person",
			name: author?.name || "Asia Experiences",
		},
		publisher: {
			"@type": "Organization",
			name: SEO_CONFIG.organization.name,
			logo: {
				"@type": "ImageObject",
				url: SEO_CONFIG.organization.logo,
			},
		},
		mainEntityOfPage: {
			"@type": "WebPage",
			"@id": `${SEO_CONFIG.siteUrl}/blog/${article.slug}`,
		},
		articleBody: article.content,
		keywords: article.tags ? article.tags.join(", ") : undefined,
	};

	return (
		<Helmet>
			<script type="application/ld+json">{JSON.stringify(schema)}</script>
		</Helmet>
	);
};

/**
 * Breadcrumb Schema Component
 * Renders BreadcrumbList schema
 * @param {Array} breadcrumbs - Array of breadcrumb items
 */
export const BreadcrumbSchema = ({ breadcrumbs }) => {
	const schema = {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: breadcrumbs.map((item, index) => ({
			"@type": "ListItem",
			position: index + 1,
			name: item.name,
			item: `${SEO_CONFIG.siteUrl}${item.url}`,
		})),
	};

	return (
		<Helmet>
			<script type="application/ld+json">{JSON.stringify(schema)}</script>
		</Helmet>
	);
};

/**
 * FAQ Schema Component
 * Renders FAQPage schema
 * @param {Array} faqs - Array of FAQ items
 */
export const FAQSchema = ({ faqs }) => {
	const schema = {
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

	return (
		<Helmet>
			<script type="application/ld+json">{JSON.stringify(schema)}</script>
		</Helmet>
	);
};

/**
 * Review Schema Component
 * Renders Review schema for testimonials
 * @param {Object} review - Review data
 */
export const ReviewSchema = ({ review }) => {
	const schema = {
		"@context": "https://schema.org",
		"@type": "Review",
		itemReviewed: {
			"@type": "TravelAgency",
			name: SEO_CONFIG.organization.name,
		},
		author: {
			"@type": "Person",
			name: review.author_name,
		},
		reviewRating: {
			"@type": "Rating",
			ratingValue: review.rating,
			bestRating: "5",
			worstRating: "1",
		},
		reviewBody: review.text,
		datePublished: review.date,
	};

	return (
		<Helmet>
			<script type="application/ld+json">{JSON.stringify(schema)}</script>
		</Helmet>
	);
};

/**
 * Aggregate Rating Schema Component
 * Renders AggregateRating schema
 * @param {Object} rating - Rating data
 */
export const AggregateRatingSchema = ({ rating }) => {
	const schema = {
		"@context": "https://schema.org",
		"@type": "Organization",
		name: SEO_CONFIG.organization.name,
		aggregateRating: {
			"@type": "AggregateRating",
			ratingValue: rating.average,
			reviewCount: rating.count,
			bestRating: "5",
			worstRating: "1",
		},
	};

	return (
		<Helmet>
			<script type="application/ld+json">{JSON.stringify(schema)}</script>
		</Helmet>
	);
};

// Export all schemas
export default {
	OrganizationSchema,
	WebSiteSchema,
	TripSchema,
	ArticleSchema,
	BreadcrumbSchema,
	FAQSchema,
	ReviewSchema,
	AggregateRatingSchema,
};
