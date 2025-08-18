import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

// Pool configuration
const pool = mysql.createPool({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
	waitForConnections: true,
	connectionLimit: 10,
	queueLimit: 0,
	enableKeepAlive: true,
	keepAliveInitialDelay: 0,
});

// Convert pool to use promises for async/await
const poolPromise = pool.promise();

/**
 * Executes a SQL query with parameters
 * @param {string} query - SQL query to execute
 * @param {Array} params - Query parameters
 * @returns {Promise} Query results
 */
export const executeQuery = async (query, params = []) => {
	try {
		const [rows] = await poolPromise.execute(query, params);
		return rows;
	} catch (error) {
		console.error("Error executing query:", error);
		throw error;
	}
};

/**
 * Executes multiple queries in a transaction
 * @param {Array} queries - Array of [query, params] pairs
 * @returns {Promise} Array of results
 */
export const executeTransaction = async (queries) => {
	const connection = await poolPromise.getConnection();
	try {
		await connection.beginTransaction();

		const results = [];
		for (const [query, params] of queries) {
			const [result] = await connection.execute(query, params);
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
 * Returns current pool status
 * @returns {Object} Pool status information
 */
export const checkPoolStatus = () => {
	return {
		threadId: pool.threadId,
		activeConnections: pool.activeConnections(),
		totalConnections: pool.totalConnections(),
		idleConnections: pool.idleConnections(),
	};
};

export default {
	pool: poolPromise,
	executeQuery,
	executeTransaction,
	checkPoolStatus,
};
