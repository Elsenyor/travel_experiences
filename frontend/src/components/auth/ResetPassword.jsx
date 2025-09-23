import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

// Material UI components
import { Box, Button, TextField, Typography, Container, Paper, Alert, CircularProgress } from "@mui/material";

/**
 * ResetPassword component
 */
const ResetPassword = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { token } = useParams(); // Get token from URL
	const [formData, setFormData] = useState({
		password: "",
		confirmPassword: "",
	});
	const [formErrors, setFormErrors] = useState({});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [success, setSuccess] = useState(false);

	// Handle form input changes
	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));

		// Clear errors when user types
		if (formErrors[name]) {
			setFormErrors((prev) => ({
				...prev,
				[name]: "",
			}));
		}

		if (error) setError(null);
	};

	// Validate form
	const validateForm = () => {
		const errors = {};

		if (!formData.password) {
			errors.password = t("validation.required");
		} else if (formData.password.length < 8) {
			errors.password = t("validation.passwordLength");
		}

		if (formData.password !== formData.confirmPassword) {
			errors.confirmPassword = t("validation.passwordsDoNotMatch");
		}

		setFormErrors(errors);
		return Object.keys(errors).length === 0;
	};

	// Handle form submission
	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		try {
			setLoading(true);
			// In a real implementation, you would call an API endpoint with the token and new password
			// For now, we'll just simulate success after a delay
			await new Promise((resolve) => setTimeout(resolve, 1000));
			setSuccess(true);

			// Redirect to login after 3 seconds
			setTimeout(() => {
				navigate("/auth/login");
			}, 3000);
		} catch (err) {
			console.error("Error al restablecer contraseña:", err);
			// Aquí iría un toast en el futuro
			setError(t("auth.resetPasswordError"));
		} finally {
			setLoading(false);
		}
	};

	return (
		<Container maxWidth="sm">
			<Paper elevation={3} sx={{ p: 4, mt: 8 }}>
				<Typography variant="h4" component="h1" align="center" gutterBottom>
					{t("auth.resetPassword")}
				</Typography>

				{error && (
					<Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
						{error}
					</Alert>
				)}

				{success ? (
					<Box>
						<Alert severity="success" sx={{ mb: 2 }}>
							{t("auth.passwordResetSuccess")}
						</Alert>
						<Typography variant="body1" paragraph>
							{t("auth.redirectingToLogin")}
						</Typography>
						<CircularProgress sx={{ display: "block", mx: "auto" }} />
					</Box>
				) : (
					<Box component="form" onSubmit={handleSubmit} noValidate>
						<Typography variant="body1" paragraph>
							{t("auth.enterNewPassword")}
						</Typography>

						<TextField
							margin="normal"
							required
							fullWidth
							name="password"
							label={t("auth.password")}
							type="password"
							id="password"
							autoComplete="new-password"
							value={formData.password}
							onChange={handleChange}
							disabled={loading}
							error={!!formErrors.password}
							helperText={formErrors.password}
						/>

						<TextField
							margin="normal"
							required
							fullWidth
							name="confirmPassword"
							label={t("auth.confirmPassword")}
							type="password"
							id="confirmPassword"
							autoComplete="new-password"
							value={formData.confirmPassword}
							onChange={handleChange}
							disabled={loading}
							error={!!formErrors.confirmPassword}
							helperText={formErrors.confirmPassword}
						/>

						<Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={loading}>
							{loading ? <CircularProgress size={24} /> : t("auth.resetPassword")}
						</Button>

						<Box sx={{ textAlign: "center", mt: 2 }}>
							<Link to="/auth/login" style={{ textDecoration: "none" }}>
								<Typography variant="body2" color="primary">
									{t("auth.backToLogin")}
								</Typography>
							</Link>
						</Box>
					</Box>
				)}
			</Paper>
		</Container>
	);
};

export default ResetPassword;
