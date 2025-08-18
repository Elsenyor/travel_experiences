import app from "./app.js";
import dotenv from "dotenv";
import sequelize from "./config/database.js";

dotenv.config();

const PORT = process.env.PORT;

// Manejar errores no capturados
process.on("uncaughtException", (err) => {
	console.error("UNCAUGHT EXCEPTION! 💥 Shutting down...");
	console.error(err.name, err.message);
	process.exit(1);
});

// Manejar promesas rechazadas no capturadas
process.on("unhandledRejection", (err) => {
	console.error("UNHANDLED REJECTION! 💥 Shutting down...");
	console.error(err.name, err.message);
	server.close(() => {
		process.exit(1);
	});
});

async function startServer() {
	try {
		// Verificar conexión a la base de datos
		await sequelize.authenticate();
		console.log("✅ Database connection has been established successfully.");

		// Iniciar servidor
		const server = app.listen(PORT, () => {
			console.log(`🚀 Server is running on port ${PORT}`);
			console.log(`📝 API Documentation available at http://localhost:${PORT}/api-docs`);
			console.log(`❤️  Health check available at http://localhost:${PORT}/health`);
		});

		// Manejar señales de terminación
		process.on("SIGTERM", () => {
			console.log("👋 SIGTERM RECEIVED. Shutting down gracefully");
			server.close(() => {
				console.log("💥 Process terminated!");
			});
		});
	} catch (error) {
		console.error("Unable to start server:", error);
		process.exit(1);
	}
}

startServer();
