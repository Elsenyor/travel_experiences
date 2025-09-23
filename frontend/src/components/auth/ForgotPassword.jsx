import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

// Material UI components
import { Box, Button, TextField, Typography, Container, Paper, Alert, CircularProgress } from "@mui/material";

/**
 * ForgotPassword component
 */
const ForgotPassword = () => {
	const { t } = useTranslation();
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [success, setSuccess] = useState(false);

	// Handle form input changes
	const handleChange = (e) => {
		setEmail(e.target.value);
		if (error) setError(null);
	};

	// Handle form submission
	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!email.trim() || !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
			setError(t("validation.invalidEmail"));
			return;
		}

		try {
			setLoading(true);
			// In a real implementation, you would call an API endpoint
			// For now, we'll just simulate success after a delay
			await new Promise((resolve) => setTimeout(resolve, 1000));
			setSuccess(true);
		} catch (err) {
			console.error("Error al solicitar restablecimiento de contraseña:", err);
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
					{t("auth.forgotPassword")}
				</Typography>

				{error && (
					<Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
						{error}
					</Alert>
				)}

				{success ? (
					<Box>
						<Alert severity="success" sx={{ mb: 2 }}>
							{t("auth.resetPasswordSuccess")}
						</Alert>
						<Typography variant="body1" paragraph>
							{t("auth.resetPasswordInstructions")}
						</Typography>
						<Box sx={{ textAlign: "center", mt: 3 }}>
							<Link to="/auth/login" style={{ textDecoration: "none" }}>
								<Button variant="contained">{t("auth.backToLogin")}</Button>
							</Link>
						</Box>
					</Box>
				) : (
					<Box component="form" onSubmit={handleSubmit} noValidate>
						<Typography variant="body1" paragraph>
							{t("auth.resetPasswordDescription")}
						</Typography>

						<TextField
							margin="normal"
							required
							fullWidth
							id="email"
							label={t("auth.email")}
							name="email"
							autoComplete="email"
							autoFocus
							value={email}
							onChange={handleChange}
							disabled={loading}
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

export default ForgotPassword;
