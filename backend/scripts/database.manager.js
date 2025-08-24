import { promises as fs } from "fs";
import { createHash } from "crypto";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import mysql from "mysql2";
import dotenv from "dotenv";

// Configure environment
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const config = {
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	multipleStatements: true,
};
const dbName = process.env.DB_NAME;
const migrationsPath = join(__dirname, "../db/migrations");
const seedsPath = join(__dirname, "../db/seeds");

// Database connection pool
let pool = null;

/**
 * Initialize database connection pool
 */
export const initializePool = () => {
	pool = mysql
		.createPool({
			...config,
			database: dbName,
			waitForConnections: true,
			connectionLimit: 10,
			queueLimit: 0,
			enableKeepAlive: true,
			keepAliveInitialDelay: 0,
		})
		.promise();
	return pool;
};

/**
 * Get the database pool, initializing if needed
 * @returns {Object} Database connection pool
 */
export const getPool = () => {
	if (!pool) {
		return initializePool();
	}
	return pool;
};

/**
 * Execute SQL query with parameters
 * @param {string} query - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<Array>} Query results
 */
export const executeQuery = async (query, params = []) => {
	const currentPool = getPool();
	try {
		const [results] = await currentPool.query(query, params);
		return results;
	} catch (error) {
		console.error("Error executing query:", error);
		throw error;
	}
};

/**
 * Execute multiple queries in a transaction
 * @param {Array<Array>} queries - Array of [query, params] pairs
 * @returns {Promise<Array>} Results array
 */
export const executeTransaction = async (queries) => {
	const currentPool = getPool();
	const connection = await currentPool.getConnection();
	try {
		await connection.beginTransaction();

		const results = [];
		for (const [query, params] of queries) {
			const [result] = await connection.query(query, params);
			results.push(result);
		}

		await connection.commit();
		return results;
	} catch (error) {
		await connection.rollback();
		throw error;
	} finally {
		connection.release();
	}
};

/**
 * Calculate SHA256 hash of content
 * @param {string} content - Content to hash
 * @returns {string} SHA256 hash
 */
export const calculateChecksum = (content) => {
	return createHash("sha256").update(content).digest("hex");
};

/**
 * Ensure database exists
 */
export const ensureDatabase = async () => {
	// Initial connection without database
	const connection = await mysql
		.createConnection({
			host: config.host,
			user: config.user,
			password: config.password,
			multipleStatements: true,
		})
		.promise();

	try {
		await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
		await connection.query(`USE ${dbName}`);
		console.log(`✅ Database '${dbName}' ensured`);
	} catch (error) {
		console.error(`Error ensuring database: ${error.message}`);
		throw error;
	} finally {
		await connection.end();
	}
};

/**
 * Ensure schema_versions table exists
 */
export const ensureSchemaVersions = async () => {
	try {
		// Try to query schema_versions table
		await executeQuery("SELECT 1 FROM schema_versions LIMIT 1");
		console.log("✅ Schema versions table exists");
		return true;
	} catch (error) {
		if (error.errno === 1146) {
			// ER_NO_SUCH_TABLE
			// Create schema_versions table
			const schemaSQL = await fs.readFile(join(__dirname, "../db/schema_versions.sql"), "utf8");
			await executeQuery(schemaSQL);
			console.log("✅ Created schema versions table");
			return false;
		}
		throw error;
	}
};

/**
 * Get current database version
 * @returns {Promise<number>} Current version
 */
export const getCurrentVersion = async () => {
	try {
		const versions = await executeQuery("SELECT MAX(version) as version FROM schema_versions WHERE success = true");
		const version = versions[0]?.version || 0;
		console.log(`Current database version: ${version}`);
		return version;
	} catch (error) {
		console.error("Error getting current version:", error);
		return 0;
	}
};

/**
 * Get all migration files
 * @returns {Promise<Array>} List of migration files
 */
export const getMigrationFiles = async () => {
	const files = await fs.readdir(migrationsPath);
	return files
		.filter((f) => f.endsWith(".sql"))
		.sort((a, b) => {
			const versionA = parseInt(a.split("_")[0]);
			const versionB = parseInt(b.split("_")[0]);
			return versionA - versionB;
		});
};

/**
 * Execute a single migration
 * @param {string} file - Migration file name
 * @param {number} version - Migration version
 */
export const executeMigration = async (file, version) => {
	const currentPool = getPool();
	const connection = await currentPool.getConnection();
	let content;
	try {
		await connection.beginTransaction();

		// Read and execute migration
		content = await fs.readFile(join(migrationsPath, file), "utf8");
		const checksum = calculateChecksum(content);

		// Check if migration was already executed
		const [executed] = await connection.query("SELECT * FROM schema_versions WHERE version = ?", [version]);

		if (executed.length > 0) {
			if (executed[0].checksum !== checksum) {
				throw new Error(`Migration ${file} has been modified after execution`);
			}
			console.log(`Migration ${file} already executed, skipping...`);
			return;
		}

		// Execute migration
		await connection.query(content);

		// Record successful migration
		await connection.query(`INSERT INTO schema_versions (version, name, checksum) VALUES (?, ?, ?)`, [version, file, checksum]);

		await connection.commit();
		console.log(`✅ Executed migration: ${file}`);
	} catch (error) {
		await connection.rollback();
		// Solo registrar el error si la migración no estaba ya registrada
		const [executed] = await connection.query("SELECT * FROM schema_versions WHERE version = ?", [version]);
		if (executed.length === 0) {
			const errorChecksum = content ? calculateChecksum(content) : "";
			await connection.query(
				`INSERT INTO schema_versions (version, name, success, error_message, checksum) 
				VALUES (?, ?, false, ?, ?)`,
				[version, file, error.message, errorChecksum]
			);
		}
		throw error;
	} finally {
		connection.release();
	}
};

/**
 * Run all pending migrations
 */
export const migrate = async () => {
	try {
		// 1. Ensure database exists
		await ensureDatabase();

		// 2. Initialize pool for subsequent operations
		initializePool();

		// 3. Ensure schema_versions table exists
		await ensureSchemaVersions();

		// 4. Get current version and run migrations
		const currentVersion = await getCurrentVersion();

		const migrationFiles = await getMigrationFiles();
		for (const file of migrationFiles) {
			const version = parseInt(file.split("_")[0]);
			if (version > currentVersion) {
				await executeMigration(file, version);
			}
		}

		console.log("✨ All migrations completed successfully");
	} catch (error) {
		console.error("Migration failed:", error);
		process.exit(1);
	}
};

/**
 * Run seed files
 */
export const seed = async () => {
	try {
		if (!pool) {
			initializePool();
		}
		const seedFiles = await fs.readdir(seedsPath);
		for (const file of seedFiles) {
			if (file.endsWith(".sql")) {
				const content = await fs.readFile(join(seedsPath, file), "utf8");
				await executeQuery(content);
				console.log(`✅ Executed seed: ${file}`);
			}
		}
	} catch (error) {
		console.error("Seeding failed:", error);
		process.exit(1);
	}
};

/**
 * Check database connection and pool status
 * @returns {Object} Status information
 */
export const checkStatus = async () => {
	const currentPool = getPool();
	const connection = await currentPool.getConnection();
	try {
		const status = {
			connected: true,
			database: dbName,
			version: await getCurrentVersion(),
			poolConfig: {
				connectionLimit: currentPool.config.connectionLimit,
				queueLimit: currentPool.config.queueLimit,
			},
		};
		return status;
	} finally {
		connection.release();
	}
};

// Execute if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
	const command = process.argv[2];

	switch (command) {
		case "migrate":
			migrate();
			break;
		case "seed":
			seed();
			break;
		case "status":
			checkStatus().then(console.log);
			break;
		default:
			console.log("Usage: node database.manager.js [migrate|seed|status]");
	}
}

// Export functions as a module
export default {
	initializePool,
	executeQuery,
	executeTransaction,
	ensureDatabase,
	ensureSchemaVersions,
	getCurrentVersion,
	getMigrationFiles,
	executeMigration,
	migrate,
	seed,
	checkStatus,
	calculateChecksum,
};
