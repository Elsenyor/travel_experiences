/**
 * Quick migration verification script
 * Checks which migrations ran successfully and which tables exist
 */

import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const dbConfig = {
	host: process.env.DB_HOST || "localhost",
	user: process.env.DB_USER || "root",
	password: process.env.DB_PASSWORD || "",
	database: process.env.DB_NAME || "asia_experiences",
	port: process.env.DB_PORT || 3306,
};

async function verifyMigrations() {
	let connection;

	try {
		console.log("🔍 Conectando a la base de datos...\n");
		connection = await mysql.createConnection(dbConfig);

		// Check if database exists
		console.log("📊 Base de datos: asia_experiences");
		console.log("=" + "=".repeat(60) + "\n");

		// Check schema_versions table
		try {
			const [migrations] = await connection.execute("SELECT version, executed_at FROM schema_versions ORDER BY executed_at");

			console.log("✅ Migraciones ejecutadas:");
			console.log("-" + "-".repeat(60));
			migrations.forEach((m) => {
				console.log(`   ✓ ${m.version} - ${m.executed_at}`);
			});
			console.log(`\nTotal: ${migrations.length} migraciones ejecutadas\n`);
		} catch (error) {
			console.error("❌ Error al leer schema_versions:", error.message);
		}

		// Check tables
		try {
			const [tables] = await connection.execute("SHOW TABLES");

			console.log("📋 Tablas creadas:");
			console.log("-" + "-".repeat(60));
			tables.forEach((t) => {
				const tableName = Object.values(t)[0];
				console.log(`   ✓ ${tableName}`);
			});
			console.log(`\nTotal: ${tables.length} tablas\n`);
		} catch (error) {
			console.error("❌ Error al listar tablas:", error.message);
		}

		// Check users table structure
		try {
			const [columns] = await connection.execute("DESCRIBE users");

			console.log("🔧 Estructura de tabla 'users':");
			console.log("-" + "-".repeat(60));
			columns.forEach((col) => {
				const type = col.Type;
				const key = col.Key ? `[${col.Key}]` : "";
				const comment = col.Comment ? `// ${col.Comment}` : "";
				console.log(`   ${col.Field.padEnd(20)} ${type.padEnd(25)} ${key} ${comment}`);
			});
			console.log("");
		} catch (error) {
			console.error("❌ Error al verificar tabla users:", error.message);
		}

		// Check if users.id is UUID (CHAR(36))
		try {
			const [columns] = await connection.execute("SHOW COLUMNS FROM users WHERE Field = 'id'");

			if (columns.length > 0) {
				const idColumn = columns[0];
				if (idColumn.Type === "char(36)") {
					console.log("✅ users.id usa UUID (CHAR(36)) - CORRECTO\n");
				} else {
					console.log(`⚠️  users.id tipo: ${idColumn.Type} - Debería ser char(36)\n`);
				}
			}
		} catch (error) {
			console.error("❌ Error al verificar tipo de ID:", error.message);
		}

		// Check trips table if exists
		try {
			const [columns] = await connection.execute("DESCRIBE trips");
			console.log("🔧 Estructura de tabla 'trips' (primeras 5 columnas):");
			console.log("-" + "-".repeat(60));
			columns.slice(0, 5).forEach((col) => {
				console.log(`   ${col.Field.padEnd(20)} ${col.Type.padEnd(25)} ${col.Key ? `[${col.Key}]` : ""}`);
			});
			console.log("");
		} catch (error) {
			console.log("ℹ️  Tabla 'trips' no encontrada (migración 004 puede no haberse ejecutado)\n");
		}

		console.log("=" + "=".repeat(60));
		console.log("✅ Verificación completada\n");
	} catch (error) {
		console.error("❌ Error general:", error.message);
		console.error("\nDetalles:", error);
	} finally {
		if (connection) {
			await connection.end();
		}
	}
}

verifyMigrations();
