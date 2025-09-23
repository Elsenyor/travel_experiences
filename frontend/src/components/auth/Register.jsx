import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../hooks/useAuth";

// Material UI components
import { Box, Button, TextField, Typography, Container, Paper, Divider, Alert, CircularProgress } from "@mui/material";

/**
 * Register component
 */
const Register = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { register, googleLogin, error, loading, clearError } = useAuth();

	const [formData, setFormData] = useState({
		name: "",
		email: "",
		password: "",
		confirmPassword: "",
	});

	const [formErrors, setFormErrors] = useState({});

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

		if (error) clearError();
	};

	// Validate form
	const validateForm = () => {
		const errors = {};

		if (!formData.name.trim()) {
			errors.name = t("validation.required");
		}

		if (!formData.email.trim()) {
			errors.email = t("validation.required");
		} else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
			errors.email = t("validation.invalidEmail");
		}

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

		const { name, email, password } = formData;
		const success = await register({ name, email, password });

		if (success) {
			navigate("/");
		}
	};

	// Handle Google registration
	const handleGoogleRegister = async () => {
		try {
			// En una implementación real, obtendríamos el token de Google OAuth
			// y lo pasaríamos a la función googleLogin
			// Por ahora, simulamos un error para mostrar el flujo completo
			const mockTokenId = "mock_token_for_development";
			const success = await googleLogin(mockTokenId);

			if (success) {
				navigate("/");
			}
		} catch (err) {
			console.error("Error en registro con Google:", err);
			// Aquí iría un toast en el futuro
		}
	};

	return (
		<Container maxWidth="sm">
			<Paper elevation={3} sx={{ p: 4, mt: 8 }}>
				<Typography variant="h4" component="h1" align="center" gutterBottom>
					{t("auth.register")}
				</Typography>

				{error && (
					<Alert severity="error" sx={{ mb: 2 }} onClose={clearError}>
						{error}
					</Alert>
				)}

				<Box component="form" onSubmit={handleSubmit} noValidate>
					<TextField
						margin="normal"
						required
						fullWidth
						id="name"
						label={t("auth.name")}
						name="name"
						autoComplete="name"
						autoFocus
						value={formData.name}
						onChange={handleChange}
						disabled={loading}
						error={!!formErrors.name}
						helperText={formErrors.name}
					/>
					<TextField
						margin="normal"
						required
						fullWidth
						id="email"
						label={t("auth.email")}
						name="email"
						autoComplete="email"
						value={formData.email}
						onChange={handleChange}
						disabled={loading}
						error={!!formErrors.email}
						helperText={formErrors.email}
					/>
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
						{loading ? <CircularProgress size={24} /> : t("auth.register")}
					</Button>

					<Divider sx={{ my: 2 }}>
						<Typography variant="body2" color="text.secondary">
							{t("common.or")}
						</Typography>
					</Divider>

					<Button fullWidth variant="outlined" onClick={handleGoogleRegister} disabled={loading} sx={{ mt: 1, mb: 2 }}>
						{t("auth.registerWithGoogle")}
					</Button>

					<Box sx={{ textAlign: "center", mt: 2 }}>
						<Typography variant="body2">
							{t("auth.haveAccount")}{" "}
							<Link to="/auth/login" style={{ textDecoration: "none" }}>
								<Typography component="span" variant="body2" color="primary">
									{t("auth.login")}
								</Typography>
							</Link>
						</Typography>
					</Box>
				</Box>
			</Paper>
		</Container>
	);
};

export default Register;
