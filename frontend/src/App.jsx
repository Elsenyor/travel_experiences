import { BrowserRouter } from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "./context/AuthContext";
import AppRoutes from "./routes/AppRoutes";

// Import i18n configuration
import "./utils/i18n";

// Create theme
const theme = createTheme({
	palette: {
		primary: {
			main: "#1976d2",
		},
		secondary: {
			main: "#dc004e",
		},
	},
});

/**
 * App component
 * This is the root component of the application
 */
function App() {
	return (
		<HelmetProvider>
			<BrowserRouter>
				<ThemeProvider theme={theme}>
					<CssBaseline />
					<AuthProvider>
						<AppRoutes />
					</AuthProvider>
				</ThemeProvider>
			</BrowserRouter>
		</HelmetProvider>
	);
}

export default App;
