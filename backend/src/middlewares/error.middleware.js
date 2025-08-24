// Clase de error personalizada (mantenida como clase por compatibilidad con Error nativo)
export class AppError extends Error {
	constructor(message, statusCode) {
		super(message);
		this.statusCode = statusCode;
		this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
		this.isOperational = true;

		Error.captureStackTrace(this, this.constructor);
	}
}

/**
 * Crea un nuevo error operacional
 * @param {string} message - Mensaje de error
 * @param {number} statusCode - Código de estado HTTP
 * @returns {AppError} Error personalizado
 */
export const createError = (message, statusCode) => {
	return new AppError(message, statusCode);
};

/**
 * Middleware de manejo de errores
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
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

export default {
	AppError,
	createError,
	errorHandler,
};
