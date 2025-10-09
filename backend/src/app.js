import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import xss from "xss-clean";
import hpp from "hpp";
import swaggerUi from "swagger-ui-express";
import dotenv from "dotenv";
import { specs } from "./config/swagger.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import authRoutes from "./routes/auth.routes.js";
import googleAuthRoutes from "./routes/google.auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import articlesRoutes from "./routes/articles.routes.js";
import tagsRoutes from "./routes/tags.routes.js";
import newsletterRoutes from "./routes/newsletter.routes.js";
import bookingsRoutes from "./routes/bookings.routes.js";
import tripsRoutes from "./routes/trips.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import faqRoutes from "./routes/faq.routes.js";
import seoRoutes from "./routes/seo.routes.js";

dotenv.config();

// Initialize express app
const app = express();

// Implement CORS with credentials
app.use(
	cors({
		origin: process.env.CORS_ORIGINS?.split(",") || "http://localhost:3000",
		credentials: true, // Important for cookies
		exposedHeaders: ["Content-Range", "X-Total-Count"], // Important for React Admin
	})
);

// Cookie parser - Needed for refresh tokens
app.use(cookieParser());

// Security headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === "development") {
	app.use(morgan("dev"));
} else {
	app.use(
		morgan("combined", {
			skip: (req, res) => res.statusCode < 400,
		})
	);
}

// Rate limiting
const limiter = rateLimit({
	max: 100,
	windowMs: 60 * 60 * 1000,
	message: "Too many requests from this IP, please try again in an hour!",
});
app.use("/api", limiter);

// Body parser
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution - but allow React Admin specific parameters
app.use(
	hpp({
		whitelist: ["_sort", "_order", "_start", "_end", "_page", "_perPage", "_filter", "q", "_include", "_exclude", "language"],
	})
);

// Compression
app.use(compression());

// Swagger Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// Health check endpoint
app.get("/health", (req, res) => {
	res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// API Routes
app.use("/api/v1/auth", authRoutes); // Local authentication routes
app.use("/api/v1/auth/google", googleAuthRoutes); // Google authentication routes
app.use("/api/v1/users", userRoutes); // User management routes
app.use("/api/v1/articles", articlesRoutes); // Articles routes
app.use("/api/v1/tags", tagsRoutes); // Tags routes
app.use("/api/v1/newsletter", newsletterRoutes); // Newsletter routes
app.use("/api/v1/bookings", bookingsRoutes); // Bookings routes
app.use("/api/v1/trips", tripsRoutes); // Trips routes
app.use("/api/v1/chat", chatRoutes); // Chat routes
app.use("/api/v1/faqs", faqRoutes); // FAQ routes

// SEO Routes (sitemap, robots.txt) - No /api/v1 prefix for standard locations
app.use("/", seoRoutes); // SEO routes (sitemap.xml, robots.txt)

// 404 handler
app.all("*", (req, res, next) => {
	res.status(404).json({
		status: "error",
		message: `Can't find ${req.originalUrl} on this server!`,
	});
});

// Error handling middleware
app.use(errorHandler);

export default app;
