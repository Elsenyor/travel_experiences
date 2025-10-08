# Common Components

## LanguageSwitcher Component

A reusable component that allows users to switch between available languages in the application.

### Features

- **Simple and clean design** with Bootstrap styling
- **Active language highlight**
- **Easy to extend** with additional languages
- **Accessible** with proper ARIA labels

### Usage

```jsx
import LanguageSwitcher from "./components/common/LanguageSwitcher";

function Header() {
	return (
		<div>
			<LanguageSwitcher />
		</div>
	);
}
```

### Customization

#### Adding More Languages

To add more languages, modify the `languages` array in the component:

```jsx
const languages = [
	{ code: "es", label: "ES" },
	{ code: "en", label: "EN" },
	{ code: "fr", label: "FR" }, // Add French
	{ code: "de", label: "DE" }, // Add German
];
```

Make sure you have the corresponding translation files in your `locales` folder.

#### Styling

The component uses Bootstrap button classes. You can customize the appearance by:

1. Modifying the button classes in the component
2. Adding custom CSS for `.language-switcher` class
3. Using Bootstrap theme variables

### Props

No props required. The component uses the `useTranslation` hook from `react-i18next`.

### Dependencies

- React 19+
- React i18next 15+
- Bootstrap 5.3+

### Integration with i18n

Ensure your `i18n` configuration is properly set up:

```jsx
// src/utils/i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

i18n
	.use(LanguageDetector)
	.use(initReactI18next)
	.init({
		resources: {
			es: { translation: require("./locales/es/translation.json") },
			en: { translation: require("./locales/en/translation.json") },
		},
		fallbackLng: "es",
		interpolation: {
			escapeValue: false,
		},
	});
```

### Reusability

This component is completely standalone and can be used in any React project with i18next. Simply:

1. Copy the component file
2. Ensure i18next is configured
3. Import and use wherever needed

### Example in Different Contexts

#### In a Navbar

```jsx
<nav>
	<div className="nav-right">
		<LanguageSwitcher />
	</div>
</nav>
```

#### In a Settings Page

```jsx
<div className="settings">
	<h3>Language Preferences</h3>
	<LanguageSwitcher />
</div>
```

#### With Custom Styling

```jsx
<div className="my-custom-wrapper">
	<LanguageSwitcher />
</div>
```

```css
.my-custom-wrapper .language-switcher .btn {
	/* Your custom styles */
	border-radius: 20px;
	padding: 0.5rem 1rem;
}
```

## Future Common Components

This directory will contain other reusable components such as:

- Loading spinners
- Alert/notification components
- Modal dialogs
- Form inputs
- Card components
- Buttons with icons
- Image galleries
- And more...

Each component will follow the same principles:

- **Standalone** and reusable
- **Well documented** with examples
- **Accessible** and responsive
- **Customizable** through props and CSS
