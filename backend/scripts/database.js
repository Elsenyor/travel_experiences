import { promises as fs } from "fs";
import { fileURLToPath } from "url";
import { dirname, join, basename } from "path";
import dotenv from "dotenv";
import dbPool from "../src/utils/database.pool.js";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure dotenv
dotenv.config({ path: join(__dirname, "../.env") });

/**
 * Executes a SQL file
 * @param {string} filePath - Path to SQL file
 */
async function executeSQL(filePath) {
	try {
		const sql = await fs.readFile(filePath, "utf8");
		console.log(`Executing ${basename(filePath)}...`);
		await dbPool.executeQuery(sql);
		console.log(`✅ ${basename(filePath)} executed successfully`);
	} catch (error) {
		console.error(`❌ Error executing ${basename(filePath)}:`, error);
		throw error;
	}
}

/**
 * Initializes the database with all SQL files
 */
async function initializeDatabase() {
	try {
		console.log("Starting database initialization...");

		// List of SQL files to execute in order
		const sqlFiles = [
			"01_create_database.sql",
			"02_create_tables.sql",
			"03_create_blog_tables.sql",
			"04_create_newsletter_tables.sql",
			"05_create_chatbot_tables.sql",
		];

		// Execute each SQL file in sequence
		const dbPath = join(__dirname, "../db");
		for (const file of sqlFiles) {
			const filePath = join(dbPath, file);
			await executeSQL(filePath);
		}

		console.log("✨ Database initialized successfully");

		// Check pool status
		const poolStatus = await dbPool.checkPoolStatus();
		console.log("📊 Pool status:", poolStatus);
	} catch (error) {
		console.error("Error during database initialization:", error);
		process.exit(1);
	}
}

// Execute if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
	initializeDatabase().finally(() => {
		// Ensure process terminates
		setTimeout(() => process.exit(0), 1000);
	});
}

export { initializeDatabase };
