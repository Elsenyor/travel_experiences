import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../hooks/useAuth";
import LanguageSwitcher from "../common/LanguageSwitcher";
import "../../styles/header.css";

/**
 * Header component
 * Main navigation header with responsive design inspired by Ratpanat
 * @returns {JSX.Element} Header component
 */
const Header = () => {
	const { t } = useTranslation();
	const { isAuthenticated, user, logout } = useAuth();
	const [isNavCollapsed, setIsNavCollapsed] = useState(true);

	const handleNavCollapse = () => setIsNavCollapsed(!isNavCollapsed);

	const handleLogout = async () => {
		await logout();
	};

	return (
		<>
			{/* Top bar with contact info */}
			<div className="bg-dark text-white py-2">
				<div className="container">
					<div className="row align-items-center">
						<div className="col-md-6">
							<small>
								<i className="bi bi-telephone me-2"></i>
								+34 639 555 555
							</small>
						</div>
						<div className="col-md-6 text-md-end">
							<small>
								<i className="bi bi-envelope me-2"></i>
								info@asiaexperiences.com
							</small>
						</div>
					</div>
				</div>
			</div>

			{/* Main navigation */}
			<nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top">
				<div className="container">
					{/* Logo */}
					<Link className="navbar-brand fw-bold text-primary fs-4" to="/">
						Asia Experiences
					</Link>

					{/* Mobile toggle button */}
					<button
						className="navbar-toggler"
						type="button"
						onClick={handleNavCollapse}
						aria-controls="navbarNav"
						aria-expanded={!isNavCollapsed}
						aria-label="Toggle navigation"
					>
						<span className="navbar-toggler-icon"></span>
					</button>

					{/* Navigation items */}
					<div className={`${isNavCollapsed ? "collapse" : ""} navbar-collapse`} id="navbarNav">
						<ul className="navbar-nav mx-auto mb-2 mb-lg-0">
							<li className="nav-item">
								<NavLink className={({ isActive }) => `nav-link ${isActive ? "active fw-semibold" : ""}`} to="/">
									{t("navigation.home")}
								</NavLink>
							</li>
							<li className="nav-item">
								<NavLink className={({ isActive }) => `nav-link ${isActive ? "active fw-semibold" : ""}`} to="/trips">
									{t("navigation.trips")}
								</NavLink>
							</li>
							<li className="nav-item">
								<NavLink className={({ isActive }) => `nav-link ${isActive ? "active fw-semibold" : ""}`} to="/blog">
									{t("navigation.blog")}
								</NavLink>
							</li>
							<li className="nav-item">
								<NavLink className={({ isActive }) => `nav-link ${isActive ? "active fw-semibold" : ""}`} to="/about">
									{t("navigation.about")}
								</NavLink>
							</li>
							<li className="nav-item">
								<NavLink className={({ isActive }) => `nav-link ${isActive ? "active fw-semibold" : ""}`} to="/contact">
									{t("navigation.contact")}
								</NavLink>
							</li>
						</ul>

						{/* Right side menu */}
						<div className="d-flex align-items-center gap-3">
							<LanguageSwitcher />

							{isAuthenticated ? (
								<div className="dropdown">
									<button
										className="btn btn-outline-primary dropdown-toggle"
										type="button"
										id="userDropdown"
										data-bs-toggle="dropdown"
										aria-expanded="false"
									>
										<i className="bi bi-person-circle me-1"></i>
										{user?.name || "User"}
									</button>
									<ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
										<li>
											<Link className="dropdown-item" to="/profile">
												<i className="bi bi-person me-2"></i>
												{t("navigation.profile")}
											</Link>
										</li>
										<li>
											<Link className="dropdown-item" to="/bookings">
												<i className="bi bi-calendar-check me-2"></i>
												{t("navigation.bookings")}
											</Link>
										</li>
										<li>
											<hr className="dropdown-divider" />
										</li>
										<li>
											<button className="dropdown-item text-danger" onClick={handleLogout}>
												<i className="bi bi-box-arrow-right me-2"></i>
												{t("navigation.logout")}
											</button>
										</li>
									</ul>
								</div>
							) : (
								<div className="d-flex gap-2">
									<Link to="/auth/login" className="btn btn-outline-primary btn-sm">
										{t("navigation.login")}
									</Link>
									<Link to="/auth/register" className="btn btn-primary btn-sm">
										{t("navigation.register")}
									</Link>
								</div>
							)}
						</div>
					</div>
				</div>
			</nav>
		</>
	);
};

export default Header;
