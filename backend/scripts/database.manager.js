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

class DatabaseManager {
	constructor() {
		this.config = {
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASSWORD,
			multipleStatements: true,
		};
		this.dbName = process.env.DB_NAME;
		this.pool = null;
		this.migrationsPath = join(__dirname, "../db/migrations");
		this.seedsPath = join(__dirname, "../db/seeds");
	}

	/**
	 * Initialize database connection pool
	 */
	initializePool() {
		this.pool = mysql
			.createPool({
				...this.config,
				database: this.dbName,
				waitForConnections: true,
				connectionLimit: 10,
				queueLimit: 0,
				enableKeepAlive: true,
				keepAliveInitialDelay: 0,
			})
			.promise();
	}

	/**
	 * Execute SQL query with parameters
	 * @param {string} query - SQL query
	 * @param {Array} params - Query parameters
	 * @returns {Promise<Array>} Query results
	 */
	async executeQuery(query, params = []) {
		try {
			const [results] = await this.pool.query(query, params);
			return results;
		} catch (error) {
			console.error("Error executing query:", error);
			throw error;
		}
	}

	/**
	 * Execute multiple queries in a transaction
	 * @param {Array<Array>} queries - Array of [query, params] pairs
	 * @returns {Promise<Array>} Results array
	 */
	async executeTransaction(queries) {
		const connection = await this.pool.getConnection();
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
	}

	/**
	 * Calculate SHA256 hash of content
	 * @param {string} content - Content to hash
	 * @returns {string} SHA256 hash
	 */
	calculateChecksum(content) {
		return createHash("sha256").update(content).digest("hex");
	}

	/**
	 * Ensure database exists
	 */
	async ensureDatabase() {
		// Initial connection without database
		const connection = await mysql
			.createConnection({
				host: this.config.host,
				user: this.config.user,
				password: this.config.password,
				multipleStatements: true,
			})
			.promise();

		try {
			await connection.query(`CREATE DATABASE IF NOT EXISTS ${this.dbName}`);
			await connection.query(`USE ${this.dbName}`);
			console.log(`✅ Database '${this.dbName}' ensured`);
		} catch (error) {
			console.error(`Error ensuring database: ${error.message}`);
			throw error;
		} finally {
			await connection.end();
		}
	}

	/**
	 * Ensure schema_versions table exists
	 */
	async ensureSchemaVersions() {
		try {
			// Try to query schema_versions table
			await this.executeQuery("SELECT 1 FROM schema_versions LIMIT 1");
			console.log("✅ Schema versions table exists");
			return true;
		} catch (error) {
			if (error.errno === 1146) {
				// ER_NO_SUCH_TABLE
				// Create schema_versions table
				const schemaSQL = await fs.readFile(join(__dirname, "../db/schema_versions.sql"), "utf8");
				await this.executeQuery(schemaSQL);
				console.log("✅ Created schema versions table");
				return false;
			}
			throw error;
		}
	}

	/**
	 * Get current database version
	 * @returns {Promise<number>} Current version
	 */
	async getCurrentVersion() {
		try {
			const versions = await this.executeQuery("SELECT MAX(version) as version FROM schema_versions WHERE success = true");
			const version = versions[0]?.version || 0;
			console.log(`Current database version: ${version}`);
			return version;
		} catch (error) {
			console.error("Error getting current version:", error);
			return 0;
		}
	}

	/**
	 * Get all migration files
	 * @returns {Promise<Array>} List of migration files
	 */
	async getMigrationFiles() {
		const files = await fs.readdir(this.migrationsPath);
		return files
			.filter((f) => f.endsWith(".sql"))
			.sort((a, b) => {
				const versionA = parseInt(a.split("_")[0]);
				const versionB = parseInt(b.split("_")[0]);
				return versionA - versionB;
			});
	}

	/**
	 * Execute a single migration
	 * @param {string} file - Migration file name
	 * @param {number} version - Migration version
	 */
	async executeMigration(file, version) {
		const connection = await this.pool.getConnection();
		let content;
		try {
			await connection.beginTransaction();

			// Read and execute migration
			content = await fs.readFile(join(this.migrationsPath, file), "utf8");
			const checksum = this.calculateChecksum(content);

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
				const errorChecksum = content ? this.calculateChecksum(content) : "";
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
	}

	/**
	 * Run all pending migrations
	 */
	async migrate() {
		try {
			// 1. Ensure database exists
			await this.ensureDatabase();

			// 2. Initialize pool for subsequent operations
			this.initializePool();

			// 3. Ensure schema_versions table exists
			await this.ensureSchemaVersions();

			// 4. Get current version and run migrations
			const currentVersion = await this.getCurrentVersion();

			const migrationFiles = await this.getMigrationFiles();
			for (const file of migrationFiles) {
				const version = parseInt(file.split("_")[0]);
				if (version > currentVersion) {
					await this.executeMigration(file, version);
				}
			}

			console.log("✨ All migrations completed successfully");
		} catch (error) {
			console.error("Migration failed:", error);
			process.exit(1);
		}
	}

	/**
	 * Run seed files
	 */
	async seed() {
		try {
			if (!this.pool) {
				this.initializePool();
			}
			const seedFiles = await fs.readdir(this.seedsPath);
			for (const file of seedFiles) {
				if (file.endsWith(".sql")) {
					const content = await fs.readFile(join(this.seedsPath, file), "utf8");
					await this.executeQuery(content);
					console.log(`✅ Executed seed: ${file}`);
				}
			}
		} catch (error) {
			console.error("Seeding failed:", error);
			process.exit(1);
		}
	}

	/**
	 * Check database connection and pool status
	 * @returns {Object} Status information
	 */
	async checkStatus() {
		if (!this.pool) {
			this.initializePool();
		}
		const connection = await this.pool.getConnection();
		try {
			const status = {
				connected: true,
				database: this.dbName,
				version: await this.getCurrentVersion(),
				poolConfig: {
					connectionLimit: this.pool.config.connectionLimit,
					queueLimit: this.pool.config.queueLimit,
				},
			};
			return status;
		} finally {
			connection.release();
		}
	}
}

// Execute if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
	const manager = new DatabaseManager();
	const command = process.argv[2];

	switch (command) {
		case "migrate":
			manager.migrate();
			break;
		case "seed":
			manager.seed();
			break;
		case "status":
			manager.checkStatus().then(console.log);
			break;
		default:
			console.log("Usage: node database.manager.js [migrate|seed|status]");
	}
}

// Export singleton instance
export default new DatabaseManager();
