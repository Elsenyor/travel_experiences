// Tipos de error personalizados
export class AppError extends Error {
	constructor(message, statusCode) {
		super(message);
		this.statusCode = statusCode;
		this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
		this.isOperational = true;

		Error.captureStackTrace(this, this.constructor);
	}
}

// Middleware de manejo de errores
export const errorHandler = (err, req, res, next) => {
	err.statusCode = err.statusCode || 500;
	err.status = err.status || "error";

	if (process.env.NODE_ENV === "development") {
		res.status(err.statusCode).json({
			status: err.status,
			error: err,
			message: err.message,
			stack: err.stack,
		});
	} else {
		// Error operacional: enviar mensaje al cliente
		if (err.isOperational) {
			res.status(err.statusCode).json({
				status: err.status,
				message: err.message,
			});
		} else {
			// Error de programación: no enviar detalles al cliente
			console.error("ERROR 💥", err);
			res.status(500).json({
				status: "error",
				message: "Something went wrong!",
			});
		}
	}
};
