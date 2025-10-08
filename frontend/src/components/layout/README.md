# Layout Components

## Header Component

The Header component provides the main navigation for the application with a responsive design inspired by Ratpanat.

### Features

- **Responsive navigation** with mobile hamburger menu
- **Top bar** with contact information
- **Language switcher** integration
- **User authentication menu** with dropdown
- **Sticky header** that stays at the top when scrolling
- **Active link highlighting** with smooth animations

### Usage

```jsx
import Header from "./components/layout/Header";

function App() {
	return (
		<div>
			<Header />
			{/* Your content */}
		</div>
	);
}
```

### Customization

The Header component uses Bootstrap 5 classes and custom CSS. You can customize the appearance by modifying:

- `src/styles/header.css` - Custom styles for header
- Bootstrap theme variables in your main CSS file

### Props

No props required. The component uses the following hooks:

- `useTranslation` - for i18n support
- `useAuth` - for authentication state

## Footer Component

The Footer component provides a comprehensive footer with newsletter subscription, links, and social media.

### Features

- **Newsletter subscription** with email validation
- **Multi-column layout** with links
- **Social media icons** with hover effects
- **Contact information** section
- **Responsive design** that adapts to all screen sizes
- **Success/error messages** for newsletter subscription

### Usage

```jsx
import Footer from "./components/layout/Footer";

function App() {
	return (
		<div>
			{/* Your content */}
			<Footer />
		</div>
	);
}
```

### Customization

The Footer component uses Bootstrap 5 classes and custom CSS. You can customize the appearance by modifying:

- `src/styles/footer.css` - Custom styles for footer
- Update social media links in the component
- Modify destination links as needed

### Props

No props required. The component uses the following hooks:

- `useTranslation` - for i18n support
- `useState` - for form state management

## MainLayout Component

The MainLayout component wraps pages with Header and Footer.

### Usage

```jsx
import { Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";

<Route path="/" element={<MainLayout />}>
	<Route index element={<Home />} />
	<Route path="trips" element={<Trips />} />
	{/* More routes */}
</Route>;
```

## Reusability

These components are designed to be reusable across different projects. To use them in another project:

1. Copy the component files
2. Copy the CSS files
3. Ensure you have the following dependencies:
   - `react-router-dom`
   - `react-i18next`
   - `bootstrap`
4. Adjust the API service imports as needed
5. Update translation keys in your i18n files

## Dependencies

- React 19+
- React Router DOM 7+
- React i18next 15+
- Bootstrap 5.3+
- Bootstrap Icons 1.11+

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)
