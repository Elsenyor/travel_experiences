import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../hooks/useAuth";

// Material UI components
import { Box, Button, TextField, Typography, Container, Paper, Divider, Alert, CircularProgress } from "@mui/material";

/**
 * Login component
 */
const Login = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { login, googleLogin, error, loading, clearError } = useAuth();

	const [formData, setFormData] = useState({
		email: "",
		password: "",
	});

	// Handle form input changes
	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
		if (error) clearError();
	};

	// Handle form submission
	const handleSubmit = async (e) => {
		e.preventDefault();
		const { email, password } = formData;
		const success = await login(email, password);
		if (success) {
			navigate("/");
		}
	};

	// Handle Google login
	const handleGoogleLogin = async () => {
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
			console.error("Error en login con Google:", err);
			// Aquí iría un toast en el futuro
		}
	};

	return (
		<Container maxWidth="sm">
			<Paper elevation={3} sx={{ p: 4, mt: 8 }}>
				<Typography variant="h4" component="h1" align="center" gutterBottom>
					{t("auth.login")}
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
						id="email"
						label={t("auth.email")}
						name="email"
						autoComplete="email"
						autoFocus
						value={formData.email}
						onChange={handleChange}
						disabled={loading}
					/>
					<TextField
						margin="normal"
						required
						fullWidth
						name="password"
						label={t("auth.password")}
						type="password"
						id="password"
						autoComplete="current-password"
						value={formData.password}
						onChange={handleChange}
						disabled={loading}
					/>

					<Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={loading}>
						{loading ? <CircularProgress size={24} /> : t("auth.login")}
					</Button>

					<Box sx={{ textAlign: "center", mb: 2 }}>
						<Link to="/auth/forgot-password" style={{ textDecoration: "none" }}>
							<Typography variant="body2" color="primary">
								{t("auth.forgotPassword")}
							</Typography>
						</Link>
					</Box>

					<Divider sx={{ my: 2 }}>
						<Typography variant="body2" color="text.secondary">
							{t("common.or")}
						</Typography>
					</Divider>

					<Button fullWidth variant="outlined" onClick={handleGoogleLogin} disabled={loading} sx={{ mt: 1, mb: 2 }}>
						{t("auth.loginWithGoogle")}
					</Button>

					<Box sx={{ textAlign: "center", mt: 2 }}>
						<Typography variant="body2">
							{t("auth.noAccount")}{" "}
							<Link to="/auth/register" style={{ textDecoration: "none" }}>
								<Typography component="span" variant="body2" color="primary">
									{t("auth.register")}
								</Typography>
							</Link>
						</Typography>
					</Box>
				</Box>
			</Paper>
		</Container>
	);
};

export default Login;
