import { useTranslation } from "react-i18next";

/**
 * LanguageSwitcher component
 * Allows users to switch between available languages
 * @returns {JSX.Element} LanguageSwitcher component
 */
const LanguageSwitcher = () => {
	const { i18n } = useTranslation();

	const changeLanguage = (lang) => {
		i18n.changeLanguage(lang);
	};

	const languages = [
		{ code: "es", label: "ES" },
		{ code: "en", label: "EN" },
	];

	return (
		<div className="language-switcher d-flex gap-2">
			{languages.map((lang) => (
				<button
					key={lang.code}
					onClick={() => changeLanguage(lang.code)}
					className={`btn btn-sm ${i18n.language === lang.code ? "btn-primary" : "btn-outline-primary"}`}
					aria-label={`Switch to ${lang.label}`}
				>
					{lang.label}
				</button>
			))}
		</div>
	);
};

export default LanguageSwitcher;
