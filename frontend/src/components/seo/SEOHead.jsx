import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { generateSEOMeta, SEO_CONFIG } from "../../config/seo.config";

/**
 * SEOHead Component
 * Renders all SEO-related meta tags using React Helmet
 * @param {Object} props - SEO properties
 * @returns {JSX.Element} Helmet component with meta tags
 */
const SEOHead = ({
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
	children,
}) => {
	const { i18n } = useTranslation();
	const currentLang = i18n.language;

	const seoMeta = generateSEOMeta({
		title,
		description,
		keywords,
		image,
		imageAlt,
		url,
		type,
		author,
		publishedTime,
		modifiedTime,
		noindex,
		nofollow,
		canonical,
	});

	// Generate hreflang tags for available languages
	const hreflangs = SEO_CONFIG.languages.map((lang) => {
		const langUrl = url ? `${SEO_CONFIG.siteUrl}/${lang}${url}` : `${SEO_CONFIG.siteUrl}/${lang}`;
		return { lang, url: langUrl };
	});

	return (
		<Helmet>
			{/* Basic Meta Tags */}
			<html lang={currentLang} />
			<title>{seoMeta.title}</title>
			<meta name="description" content={seoMeta.description} />
			<meta name="keywords" content={seoMeta.keywords} />

			{/* Canonical URL */}
			{seoMeta.canonical && <link rel="canonical" href={`${SEO_CONFIG.siteUrl}${seoMeta.canonical}`} />}

			{/* Robots Meta */}
			<meta name="robots" content={`${seoMeta.robots.index ? "index" : "noindex"}, ${seoMeta.robots.follow ? "follow" : "nofollow"}`} />

			{/* Open Graph Meta Tags */}
			<meta property="og:type" content={seoMeta.openGraph.type} />
			<meta property="og:title" content={seoMeta.openGraph.title} />
			<meta property="og:description" content={seoMeta.openGraph.description} />
			<meta property="og:url" content={seoMeta.openGraph.url} />
			<meta property="og:site_name" content={seoMeta.openGraph.siteName} />
			<meta property="og:image" content={seoMeta.openGraph.image} />
			<meta property="og:image:alt" content={seoMeta.imageAlt} />
			<meta property="og:locale" content={currentLang === "es" ? "es_ES" : "en_US"} />

			{/* Article specific Open Graph tags */}
			{type === "article" && seoMeta.article && (
				<>
					{seoMeta.article.publishedTime && <meta property="article:published_time" content={seoMeta.article.publishedTime} />}
					{seoMeta.article.modifiedTime && <meta property="article:modified_time" content={seoMeta.article.modifiedTime} />}
					{seoMeta.article.author && <meta property="article:author" content={seoMeta.article.author} />}
				</>
			)}

			{/* Twitter Card Meta Tags */}
			<meta name="twitter:card" content={seoMeta.twitter.card} />
			<meta name="twitter:site" content={seoMeta.twitter.site} />
			<meta name="twitter:creator" content={seoMeta.twitter.creator} />
			<meta name="twitter:title" content={seoMeta.twitter.title} />
			<meta name="twitter:description" content={seoMeta.twitter.description} />
			<meta name="twitter:image" content={seoMeta.twitter.image} />
			<meta name="twitter:image:alt" content={seoMeta.imageAlt} />

			{/* Hreflang Tags for Internationalization */}
			{hreflangs.map(({ lang, url }) => (
				<link key={lang} rel="alternate" hreflang={lang} href={url} />
			))}
			<link rel="alternate" hreflang="x-default" href={`${SEO_CONFIG.siteUrl}${url || ""}`} />

			{/* Additional children (custom meta tags, scripts, etc.) */}
			{children}
		</Helmet>
	);
};

export default SEOHead;
