import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize({
	host: process.env.DB_HOST,
	database: process.env.DB_NAME,
	username: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	dialect: "mysql",
	logging: process.env.NODE_ENV === "development" ? console.log : false,
	timezone: "+00:00",
	pool: {
		max: 10, // máximo de conexiones en el pool
		min: 0, // mínimo de conexiones en el pool
		acquire: 30000, // tiempo máximo para obtener una conexión
		idle: 10000, // tiempo máximo que una conexión puede estar inactiva
	},
	define: {
		timestamps: true,
		underscored: true,
	},
});

export default sequelize;
