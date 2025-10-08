# SEO Components

Components for managing SEO meta tags, Open Graph, Twitter Cards, and Schema.org structured data.

## Installation

Install required dependency:

```bash
npm install react-helmet-async
```

Then wrap your app with HelmetProvider:

```jsx
import { HelmetProvider } from "react-helmet-async";

<HelmetProvider>
	<App />
</HelmetProvider>;
```

## Components

### SEOHead

Main component for managing all SEO meta tags.

**Usage:**

```jsx
import SEOHead from "./components/seo/SEOHead";

const TripDetail = ({ trip }) => (
	<>
		<SEOHead title={trip.title} description={trip.description} image={trip.main_image} url={`/trips/${trip.slug}`} type="website" />
		{/* Your content */}
	</>
);
```

**Props:**

- `title` (string): Page title
- `description` (string): Meta description
- `keywords` (string): Meta keywords
- `image` (string): OG image URL
- `imageAlt` (string): Image alt text
- `url` (string): Canonical URL
- `type` (string): OG type (website, article, etc.)
- `author` (string): Article author
- `publishedTime` (string): Publication date (ISO format)
- `modifiedTime` (string): Last modified date (ISO format)
- `noindex` (boolean): Prevent indexing
- `nofollow` (boolean): Prevent following links
- `canonical` (string): Canonical URL override

### Schema Markup Components

#### OrganizationSchema

For homepage - displays organization information.

```jsx
import { OrganizationSchema } from "./components/seo/SchemaMarkup";

<OrganizationSchema />;
```

#### WebSiteSchema

For homepage - enables site search in Google.

```jsx
import { WebSiteSchema } from "./components/seo/SchemaMarkup";

<WebSiteSchema />;
```

#### TripSchema

For trip detail pages.

```jsx
import { TripSchema } from "./components/seo/SchemaMarkup";

<TripSchema trip={tripData} />;
```

**Required trip data:**

```javascript
{
  title: "Trip to Japan",
  description: "Amazing 15-day journey",
  main_image: "/images/japan.jpg",
  slug: "trip-to-japan",
  price: 2500,
  available_spots: 10,
  start_date: "2025-06-01",
  itinerary: [
    { title: "Day 1", description: "Arrival in Tokyo" },
    // ...
  ]
}
```

#### ArticleSchema

For blog articles.

```jsx
import { ArticleSchema } from "./components/seo/SchemaMarkup";

<ArticleSchema article={articleData} author={authorData} />;
```

**Required article data:**

```javascript
{
  title: "Best places in Bali",
  excerpt: "Discover the top destinations",
  featured_image: "/images/bali.jpg",
  slug: "best-places-bali",
  published_at: "2025-01-08T10:00:00Z",
  updated_at: "2025-01-09T15:30:00Z",
  content: "Full article content...",
  tags: ["bali", "indonesia", "travel"]
}
```

#### BreadcrumbSchema

For navigation breadcrumbs.

```jsx
import { BreadcrumbSchema } from "./components/seo/SchemaMarkup";

<BreadcrumbSchema
	breadcrumbs={[
		{ name: "Home", url: "/" },
		{ name: "Trips", url: "/trips" },
		{ name: "Japan", url: "/trips/japan" },
	]}
/>;
```

#### FAQSchema

For FAQ pages.

```jsx
import { FAQSchema } from "./components/seo/SchemaMarkup";

<FAQSchema
	faqs={[
		{
			question: "What's included?",
			answer: "All accommodations and meals...",
		},
		// ...
	]}
/>;
```

#### ReviewSchema

For individual reviews/testimonials.

```jsx
import { ReviewSchema } from "./components/seo/SchemaMarkup";

<ReviewSchema
	review={{
		author_name: "John Doe",
		rating: 5,
		text: "Amazing experience!",
		date: "2025-01-08",
	}}
/>;
```

#### AggregateRatingSchema

For overall ratings.

```jsx
import { AggregateRatingSchema } from "./components/seo/SchemaMarkup";

<AggregateRatingSchema
	rating={{
		average: 4.8,
		count: 127,
	}}
/>;
```

## Complete Page Example

```jsx
import SEOHead from "./components/seo/SEOHead";
import { TripSchema, BreadcrumbSchema, FAQSchema } from "./components/seo/SchemaMarkup";

const TripDetail = ({ trip, faqs }) => {
	const breadcrumbs = [
		{ name: "Home", url: "/" },
		{ name: "Trips", url: "/trips" },
		{ name: trip.title, url: `/trips/${trip.slug}` },
	];

	return (
		<>
			{/* SEO Meta Tags */}
			<SEOHead title={trip.title} description={trip.description} image={trip.main_image} url={`/trips/${trip.slug}`} type="website" />

			{/* Structured Data */}
			<TripSchema trip={trip} />
			<BreadcrumbSchema breadcrumbs={breadcrumbs} />
			{faqs && <FAQSchema faqs={faqs} />}

			{/* Page Content */}
			<div className="trip-detail">
				<h1>{trip.title}</h1>
				{/* ... */}
			</div>
		</>
	);
};
```

## Testing

### Validation Tools

1. **Google Rich Results Test**

   - URL: https://search.google.com/test/rich-results
   - Test your structured data

2. **Facebook Sharing Debugger**

   - URL: https://developers.facebook.com/tools/debug/
   - Test Open Graph tags

3. **Twitter Card Validator**

   - URL: https://cards-dev.twitter.com/validator
   - Test Twitter Cards

4. **Schema.org Validator**
   - URL: https://validator.schema.org/
   - Validate JSON-LD syntax

### Lighthouse SEO Audit

Run Lighthouse in Chrome DevTools:

1. Open DevTools (F12)
2. Go to Lighthouse tab
3. Select "SEO" category
4. Click "Generate report"

Target score: **> 90**

## Best Practices

### 1. Unique Content

✅ **Do:**

- Write unique titles and descriptions for each page
- Use relevant keywords naturally
- Keep titles under 60 characters
- Keep descriptions under 160 characters

❌ **Don't:**

- Duplicate meta tags across pages
- Stuff keywords
- Use generic titles like "Home" or "Page"

### 2. Images

✅ **Do:**

- Always provide OG images (1200x630px recommended)
- Use descriptive alt text
- Optimize image size
- Use WebP format when possible

❌ **Don't:**

- Use images without alt text
- Use low-quality or pixelated images
- Forget to specify image dimensions

### 3. URLs

✅ **Do:**

- Use clean, descriptive URLs
- Include main keyword in URL
- Keep URLs short and readable

❌ **Don't:**

- Use query parameters when avoidable
- Use special characters
- Create overly long URLs

### 4. Structured Data

✅ **Do:**

- Validate all schema markup
- Keep data accurate and up-to-date
- Use appropriate schema types

❌ **Don't:**

- Add misleading information
- Use deprecated schema types
- Forget to test after changes

## Configuration

Edit `frontend/src/config/seo.config.js` to customize default values:

```javascript
export const SEO_CONFIG = {
	defaultTitle: "Your Site Title",
	siteUrl: "https://yoursite.com",
	defaultImage: "/images/og-default.jpg",
	organization: {
		name: "Your Company",
		// ...
	},
};
```

## Internationalization

The SEO components automatically handle multiple languages using react-i18next. Hreflang tags are generated for all configured languages.

## Performance Impact

- Schema markup: Minimal (< 5KB per page)
- Meta tags: Negligible
- No runtime performance impact
- Improves SEO ranking (indirect performance benefit)

## Troubleshooting

### Schema not showing in Google

1. Verify schema with validator
2. Check robots.txt isn't blocking
3. Wait 1-2 weeks for Google to crawl
4. Submit sitemap to Search Console

### OG images not showing

1. Check image URL is absolute
2. Verify image is accessible
3. Clear Facebook cache in debugger
4. Ensure image meets size requirements

## Additional Resources

- [Google SEO Starter Guide](https://developers.google.com/search/docs/beginner/seo-starter-guide)
- [Schema.org Documentation](https://schema.org/)
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Cards Guide](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)
