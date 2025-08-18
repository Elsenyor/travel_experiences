import swaggerJsdoc from "swagger-jsdoc";

const options = {
	definition: {
		openapi: "3.0.0",
		info: {
			title: "Asia Experiences API",
			version: "1.0.0",
			description: "API documentation for Asia Experiences travel platform",
		},
		servers: [
			{
				url: `http://localhost:${process.env.PORT}`,
				description: "Development server",
			},
		],
		components: {
			securitySchemes: {
				bearerAuth: {
					type: "http",
					scheme: "bearer",
					bearerFormat: "JWT",
				},
			},
		},
	},
	apis: ["./src/routes/*.js"], // Rutas para buscar anotaciones de swagger
};

export const specs = swaggerJsdoc(options);
