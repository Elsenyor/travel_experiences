import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../hooks/useAuth";

// Material UI components
import { Box, Typography, Container, Paper, Alert, CircularProgress } from "@mui/material";

/**
 * GoogleLogin component
 * This component handles the OAuth callback from Google
 */
const GoogleLogin = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { googleLogin, error } = useAuth();
	const [loading, setLoading] = useState(true);
	const [localError, setLocalError] = useState(null);

	useEffect(() => {
		const processGoogleLogin = async () => {
			try {
				// In a real implementation, you would extract the token from the URL
				// and pass it to the googleLogin function
				const urlParams = new URLSearchParams(window.location.search);
				const tokenId = urlParams.get("token");

				if (!tokenId) {
					setLocalError(t("auth.invalidToken"));
					setLoading(false);
					return;
				}

				const success = await googleLogin(tokenId);
				if (success) {
					navigate("/");
				} else {
					setLoading(false);
				}
			} catch (err) {
				setLocalError(err.message || t("auth.googleLoginError"));
				setLoading(false);
			}
		};

		processGoogleLogin();
	}, [googleLogin, navigate, t]);

	return (
		<Container maxWidth="sm">
			<Paper elevation={3} sx={{ p: 4, mt: 8 }}>
				<Typography variant="h4" component="h1" align="center" gutterBottom>
					{t("auth.googleLogin")}
				</Typography>

				{loading ? (
					<Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
						<CircularProgress />
					</Box>
				) : (
					<>
						{(error || localError) && (
							<Alert severity="error" sx={{ mb: 2 }}>
								{error || localError}
							</Alert>
						)}
						<Typography variant="body1" align="center">
							{t("auth.googleLoginFailed")}
						</Typography>
						<Box sx={{ textAlign: "center", mt: 3 }}>
							<Typography variant="body2" color="primary" sx={{ cursor: "pointer" }} onClick={() => navigate("/auth/login")}>
								{t("auth.backToLogin")}
							</Typography>
						</Box>
					</>
				)}
			</Paper>
		</Container>
	);
};

export default GoogleLogin;
