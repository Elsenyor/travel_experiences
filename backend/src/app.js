import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import rateLimit from "express-rate-limit";
import xss from "xss-clean";
import hpp from "hpp";
import swaggerUi from "swagger-ui-express";
import dotenv from "dotenv";
import { specs } from "./config/swagger.js";
import { errorHandler } from "./middlewares/error.middleware.js";

dotenv.config();

// Initialize express app
const app = express();

// Implementar CORS
app.use(
	cors({
		origin: process.env.CORS_ORIGINS?.split(",") || "http://localhost:3000",
		credentials: true,
	})
);

// Security headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === "development") {
	app.use(morgan("dev"));
} else {
	// Logging para producción
	app.use(
		morgan("combined", {
			skip: (req, res) => res.statusCode < 400, // Solo log errores en producción
		})
	);
}

// Rate limiting
const limiter = rateLimit({
	max: 100, // Límite de 100 peticiones
	windowMs: 60 * 60 * 1000, // Por hora
	message: "Too many requests from this IP, please try again in an hour!",
});
app.use("/api", limiter);

// Body parser
app.use(express.json({ limit: "10kb" })); // Limitar tamaño del body
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Data sanitization contra XSS
app.use(xss());

// Prevenir parameter pollution
app.use(hpp());

// Compression
app.use(compression());

// Swagger Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// Health check endpoint
app.get("/health", (req, res) => {
	res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// API Routes will be added here
// app.use('/api/v1/auth', authRoutes);
// app.use('/api/v1/users', userRoutes);
// app.use('/api/v1/trips', tripRoutes);

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
