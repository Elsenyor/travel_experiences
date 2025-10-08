import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import * as newsletterService from "../../services/newsletter.service";
import "../../styles/footer.css";

/**
 * Footer component
 * Main footer with links, newsletter subscription, and social media
 * Inspired by Ratpanat design
 * @returns {JSX.Element} Footer component
 */
const Footer = () => {
	const { t, i18n } = useTranslation();
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState({ type: "", text: "" });

	const handleNewsletterSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setMessage({ type: "", text: "" });

		try {
			await newsletterService.subscribe({
				email,
				language: i18n.language,
			});

			setMessage({
				type: "success",
				text: t("home.newsletter.success"),
			});
			setEmail("");
		} catch (error) {
			setMessage({
				type: "danger",
				text: error.response?.data?.message || t("home.newsletter.error"),
			});
		} finally {
			setLoading(false);
		}
	};

	const currentYear = new Date().getFullYear();

	return (
		<footer className="bg-dark text-white mt-auto">
			{/* Newsletter section */}
			<div className="bg-primary py-5">
				<div className="container">
					<div className="row align-items-center">
						<div className="col-lg-6 mb-3 mb-lg-0">
							<h3 className="h4 mb-2">{t("home.newsletter.title")}</h3>
							<p className="mb-0">{t("home.newsletter.subtitle")}</p>
						</div>
						<div className="col-lg-6">
							<form onSubmit={handleNewsletterSubmit}>
								<div className="input-group">
									<input
										type="email"
										className="form-control"
										placeholder={t("home.newsletter.placeholder")}
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										required
										disabled={loading}
									/>
									<button className="btn btn-light" type="submit" disabled={loading}>
										{loading ? (
											<span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
										) : (
											<i className="bi bi-envelope me-2"></i>
										)}
										{t("home.newsletter.button")}
									</button>
								</div>
								{message.text && (
									<div className={`alert alert-${message.type} mt-2 mb-0`} role="alert">
										{message.text}
									</div>
								)}
							</form>
						</div>
					</div>
				</div>
			</div>

			{/* Main footer content */}
			<div className="py-5">
				<div className="container">
					<div className="row">
						{/* About section */}
						<div className="col-lg-4 mb-4 mb-lg-0">
							<h5 className="text-uppercase mb-3">Asia Experiences</h5>
							<p className="text-white-50">{t("home.hero.subtitle")}</p>
							{/* Social media links */}
							<div className="d-flex gap-3 mt-3">
								<a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-white" aria-label="Facebook">
									<i className="bi bi-facebook fs-4"></i>
								</a>
								<a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-white" aria-label="Instagram">
									<i className="bi bi-instagram fs-4"></i>
								</a>
								<a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-white" aria-label="Twitter">
									<i className="bi bi-twitter fs-4"></i>
								</a>
								<a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-white" aria-label="YouTube">
									<i className="bi bi-youtube fs-4"></i>
								</a>
							</div>
						</div>

						{/* Quick links */}
						<div className="col-lg-2 col-md-6 mb-4 mb-lg-0">
							<h5 className="text-uppercase mb-3">{t("navigation.home")}</h5>
							<ul className="list-unstyled">
								<li className="mb-2">
									<Link to="/" className="text-white-50 text-decoration-none">
										{t("navigation.home")}
									</Link>
								</li>
								<li className="mb-2">
									<Link to="/trips" className="text-white-50 text-decoration-none">
										{t("navigation.trips")}
									</Link>
								</li>
								<li className="mb-2">
									<Link to="/blog" className="text-white-50 text-decoration-none">
										{t("navigation.blog")}
									</Link>
								</li>
								<li className="mb-2">
									<Link to="/about" className="text-white-50 text-decoration-none">
										{t("navigation.about")}
									</Link>
								</li>
								<li className="mb-2">
									<Link to="/contact" className="text-white-50 text-decoration-none">
										{t("navigation.contact")}
									</Link>
								</li>
							</ul>
						</div>

						{/* Destinations */}
						<div className="col-lg-3 col-md-6 mb-4 mb-lg-0">
							<h5 className="text-uppercase mb-3">{t("trips.filters.destination")}</h5>
							<ul className="list-unstyled">
								<li className="mb-2">
									<Link to="/trips?destination=thailand" className="text-white-50 text-decoration-none">
										Thailand
									</Link>
								</li>
								<li className="mb-2">
									<Link to="/trips?destination=vietnam" className="text-white-50 text-decoration-none">
										Vietnam
									</Link>
								</li>
								<li className="mb-2">
									<Link to="/trips?destination=japan" className="text-white-50 text-decoration-none">
										Japan
									</Link>
								</li>
								<li className="mb-2">
									<Link to="/trips?destination=india" className="text-white-50 text-decoration-none">
										India
									</Link>
								</li>
								<li className="mb-2">
									<Link to="/trips?destination=sri-lanka" className="text-white-50 text-decoration-none">
										Sri Lanka
									</Link>
								</li>
							</ul>
						</div>

						{/* Contact info */}
						<div className="col-lg-3 col-md-6">
							<h5 className="text-uppercase mb-3">{t("navigation.contact")}</h5>
							<ul className="list-unstyled text-white-50">
								<li className="mb-2">
									<i className="bi bi-geo-alt me-2"></i>
									Pasaje test, 1<br />
									<span className="ms-4">03690 Alicante, España</span>
								</li>
								<li className="mb-2">
									<i className="bi bi-telephone me-2"></i>
									+34 639 555 555
								</li>
								<li className="mb-2">
									<i className="bi bi-envelope me-2"></i>
									info@asiaexperiences.com
								</li>
								<li className="mb-2">
									<i className="bi bi-clock me-2"></i>
									Lun - Vie: 10:00 - 19:30
								</li>
							</ul>
						</div>
					</div>
				</div>
			</div>

			{/* Copyright section */}
			<div className="border-top border-secondary py-4">
				<div className="container">
					<div className="row align-items-center">
						<div className="col-md-6 text-center text-md-start mb-2 mb-md-0">
							<small className="text-white-50">© {currentYear} Asia Experiences. All rights reserved.</small>
						</div>
						<div className="col-md-6 text-center text-md-end">
							<Link to="/privacy" className="text-white-50 text-decoration-none me-3">
								<small>Privacy Policy</small>
							</Link>
							<Link to="/terms" className="text-white-50 text-decoration-none">
								<small>Terms & Conditions</small>
							</Link>
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
