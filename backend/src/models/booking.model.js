import dbPool from "../utils/database.pool.js";
import { generateUUID } from "../utils/uuid.service.js";

/**
 * Find booking by ID
 * @param {string} id - Booking UUID
 * @returns {Promise<Object|null>} Booking object or null if not found
 */
export const findById = async (id) => {
	const query = `
		SELECT 
			b.id, b.user_id, b.trip_id, b.booking_date, b.trip_date, 
			b.num_people, b.status, b.comments, b.created_at, b.updated_at,
			u.name as user_name, u.email as user_email,
			t.destination, tt.title as trip_title
		FROM bookings b
		LEFT JOIN users u ON b.user_id = u.id
		LEFT JOIN trips t ON b.trip_id = t.id
		LEFT JOIN trip_translations tt ON t.id = tt.trip_id AND tt.language = 'es'
		WHERE b.id = ?
	`;
	try {
		const booking = await dbPool.executeQuery(query, [id]);
		return booking[0] || null;
	} catch (error) {
		throw new Error(`Error finding booking: ${error.message}`);
	}
};

/**
 * Create new booking
 * @param {Object} bookingData - Booking data
 * @param {string} bookingData.user_id - User ID making the booking
 * @param {string} bookingData.trip_id - Trip ID being booked
 * @param {string} bookingData.trip_date - Selected trip date (YYYY-MM-DD)
 * @param {number} bookingData.num_people - Number of people in booking
 * @param {string} bookingData.status - Booking status (default: "pending")
 * @param {string} bookingData.comments - Additional booking comments
 * @returns {Promise<string>} Created booking ID (UUID)
 */
export const create = async ({ user_id, trip_id, trip_date, num_people, status = "pending", comments = null }) => {
	// Validate availability first
	const availabilityQuery = `
		SELECT available_spots 
		FROM available_dates 
		WHERE trip_id = ? AND start_date <= ? AND end_date >= ?
	`;

	try {
		const availability = await dbPool.executeQuery(availabilityQuery, [trip_id, trip_date, trip_date]);

		if (!availability.length) {
			throw new Error("No availability found for the selected date");
		}

		if (availability[0].available_spots < num_people) {
			throw new Error(`Not enough spots available. Only ${availability[0].available_spots} spots left`);
		}

		// Generate UUID for new booking
		const id = generateUUID();

		// Create booking
		const query = `
			INSERT INTO bookings 
			(id, user_id, trip_id, trip_date, num_people, status, comments) 
			VALUES (?, ?, ?, ?, ?, ?, ?)
		`;

		await dbPool.executeQuery(query, [id, user_id, trip_id, trip_date, num_people, status, comments]);

		// Update available spots
		const updateAvailabilityQuery = `
			UPDATE available_dates 
			SET available_spots = available_spots - ? 
			WHERE trip_id = ? AND start_date <= ? AND end_date >= ?
		`;

		await dbPool.executeQuery(updateAvailabilityQuery, [num_people, trip_id, trip_date, trip_date]);

		return id;
	} catch (error) {
		throw new Error(`Error creating booking: ${error.message}`);
	}
};

/**
 * Update booking data
 * @param {string} id - Booking UUID
 * @param {Object} updateData - Data to update
 * @returns {Promise<boolean>} True if updated, false otherwise
 */
export const update = async (id, updateData) => {
	const allowedFields = ["trip_date", "num_people", "status", "comments"];
	const updates = [];
	const values = [];

	// Get current booking data for availability calculations if needed
	let currentBooking = null;
	if (updateData.trip_date || updateData.num_people !== undefined) {
		currentBooking = await findById(id);
		if (!currentBooking) {
			throw new Error("Booking not found");
		}
	}

	// Handle special case for updating number of people or date
	if (
		(updateData.num_people !== undefined && updateData.num_people !== currentBooking.num_people) ||
		(updateData.trip_date && updateData.trip_date !== currentBooking.trip_date)
	) {
		// If changing date, we need to check availability for new date
		const tripDate = updateData.trip_date || currentBooking.trip_date;
		const tripId = currentBooking.trip_id;

		// Calculate people difference
		const peopleDiff = updateData.num_people !== undefined ? updateData.num_people - currentBooking.num_people : 0;

		if (peopleDiff > 0) {
			// Check if additional spots are available
			const availabilityQuery = `
				SELECT available_spots 
				FROM available_dates 
				WHERE trip_id = ? AND start_date <= ? AND end_date >= ?
			`;

			const availability = await dbPool.executeQuery(availabilityQuery, [tripId, tripDate, tripDate]);

			if (!availability.length) {
				throw new Error("No availability found for the selected date");
			}

			if (availability[0].available_spots < peopleDiff) {
				throw new Error(`Not enough spots available. Only ${availability[0].available_spots} spots left`);
			}
		}

		// Update available spots for old date if changing date
		if (updateData.trip_date && updateData.trip_date !== currentBooking.trip_date) {
			// Return spots to old date
			const returnSpotsQuery = `
				UPDATE available_dates 
				SET available_spots = available_spots + ? 
				WHERE trip_id = ? AND start_date <= ? AND end_date >= ?
			`;

			await dbPool.executeQuery(returnSpotsQuery, [currentBooking.num_people, tripId, currentBooking.trip_date, currentBooking.trip_date]);

			// Take spots from new date
			const takeSpotsQuery = `
				UPDATE available_dates 
				SET available_spots = available_spots - ? 
				WHERE trip_id = ? AND start_date <= ? AND end_date >= ?
			`;

			const numPeople = updateData.num_people !== undefined ? updateData.num_people : currentBooking.num_people;

			await dbPool.executeQuery(takeSpotsQuery, [numPeople, tripId, updateData.trip_date, updateData.trip_date]);
		}
		// Update available spots if only changing number of people
		else if (peopleDiff !== 0) {
			const updateAvailabilityQuery = `
				UPDATE available_dates 
				SET available_spots = available_spots - ? 
				WHERE trip_id = ? AND start_date <= ? AND end_date >= ?
			`;

			await dbPool.executeQuery(updateAvailabilityQuery, [peopleDiff, tripId, tripDate, tripDate]);
		}
	}

	// Handle status change from active to cancelled
	if (updateData.status === "cancelled" && currentBooking && currentBooking.status !== "cancelled") {
		// Return spots to availability
		const returnSpotsQuery = `
			UPDATE available_dates 
			SET available_spots = available_spots + ? 
			WHERE trip_id = ? AND start_date <= ? AND end_date >= ?
		`;

		await dbPool.executeQuery(returnSpotsQuery, [
			currentBooking.num_people,
			currentBooking.trip_id,
			currentBooking.trip_date,
			currentBooking.trip_date,
		]);
	}

	// Build update query
	Object.keys(updateData).forEach((key) => {
		if (allowedFields.includes(key)) {
			updates.push(`${key} = ?`);
			values.push(updateData[key]);
		}
	});

	if (updates.length === 0) return null;

	values.push(id);
	const query = `UPDATE bookings SET ${updates.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;

	try {
		const result = await dbPool.executeQuery(query, values);
		return result.affectedRows > 0;
	} catch (error) {
		throw new Error(`Error updating booking: ${error.message}`);
	}
};

/**
 * Remove booking
 * @param {string} id - Booking UUID
 * @returns {Promise<boolean>} True if removed, false otherwise
 */
export const remove = async (id) => {
	// Get booking details first to return spots to availability
	const booking = await findById(id);
	if (!booking) {
		throw new Error("Booking not found");
	}

	// Only return spots if booking was not cancelled
	if (booking.status !== "cancelled") {
		const returnSpotsQuery = `
			UPDATE available_dates 
			SET available_spots = available_spots + ? 
			WHERE trip_id = ? AND start_date <= ? AND end_date >= ?
		`;

		await dbPool.executeQuery(returnSpotsQuery, [booking.num_people, booking.trip_id, booking.trip_date, booking.trip_date]);
	}

	const query = "DELETE FROM bookings WHERE id = ?";
	try {
		const result = await dbPool.executeQuery(query, [id]);
		return result.affectedRows > 0;
	} catch (error) {
		throw new Error(`Error deleting booking: ${error.message}`);
	}
};

/**
 * Find bookings by multiple criteria
 * @param {Object} filters - Search filters
 * @param {string} filters.user_id - Filter by user ID
 * @param {string} filters.trip_id - Filter by trip ID
 * @param {string} filters.status - Filter by status
 * @param {string} filters.start_date - Filter by bookings after this date
 * @param {string} filters.end_date - Filter by bookings before this date
 * @param {number} filters.limit - Results limit
 * @param {number} filters.offset - Results offset
 * @param {string} filters.sortField - Field to sort by
 * @param {string} filters.sortOrder - Sort order (ASC or DESC)
 * @returns {Promise<Array>} Array of bookings
 */
export const findByFilters = async ({
	user_id,
	trip_id,
	status,
	start_date,
	end_date,
	limit = 10,
	offset = 0,
	sortField = "booking_date",
	sortOrder = "DESC",
}) => {
	let query = `
		SELECT 
			b.id, b.user_id, b.trip_id, b.booking_date, b.trip_date, 
			b.num_people, b.status, b.comments, b.created_at, b.updated_at,
			u.name as user_name, u.email as user_email,
			t.destination, tt.title as trip_title
		FROM bookings b
		LEFT JOIN users u ON b.user_id = u.id
		LEFT JOIN trips t ON b.trip_id = t.id
		LEFT JOIN trip_translations tt ON t.id = tt.trip_id AND tt.language = 'es'
		WHERE 1=1
	`;

	const values = [];

	if (user_id) {
		query += " AND b.user_id = ?";
		values.push(user_id);
	}

	if (trip_id) {
		query += " AND b.trip_id = ?";
		values.push(trip_id);
	}

	if (status) {
		query += " AND b.status = ?";
		values.push(status);
	}

	if (start_date) {
		query += " AND b.trip_date >= ?";
		values.push(start_date);
	}

	if (end_date) {
		query += " AND b.trip_date <= ?";
		values.push(end_date);
	}

	// Validate sort field to prevent SQL injection
	const allowedSortFields = ["id", "booking_date", "trip_date", "num_people", "status", "created_at"];
	const validSortField = allowedSortFields.includes(sortField) ? sortField : "booking_date";

	// Validate sort order
	const validSortOrder = ["ASC", "DESC"].includes(sortOrder) ? sortOrder : "DESC";

	query += ` ORDER BY b.${validSortField} ${validSortOrder} LIMIT ? OFFSET ?`;
	values.push(parseInt(limit), parseInt(offset));

	try {
		return await dbPool.executeQuery(query, values);
	} catch (error) {
		throw new Error(`Error searching bookings: ${error.message}`);
	}
};

/**
 * Count bookings by filters
 * @param {Object} filters - Search filters
 * @param {string} filters.user_id - Filter by user ID
 * @param {string} filters.trip_id - Filter by trip ID
 * @param {string} filters.status - Filter by status
 * @param {string} filters.start_date - Filter by bookings after this date
 * @param {string} filters.end_date - Filter by bookings before this date
 * @returns {Promise<number>} Count of matching bookings
 */
export const countByFilters = async ({ user_id, trip_id, status, start_date, end_date }) => {
	let query = "SELECT COUNT(*) as total FROM bookings WHERE 1=1";
	const values = [];

	if (user_id) {
		query += " AND user_id = ?";
		values.push(user_id);
	}

	if (trip_id) {
		query += " AND trip_id = ?";
		values.push(trip_id);
	}

	if (status) {
		query += " AND status = ?";
		values.push(status);
	}

	if (start_date) {
		query += " AND trip_date >= ?";
		values.push(start_date);
	}

	if (end_date) {
		query += " AND trip_date <= ?";
		values.push(end_date);
	}

	try {
		const result = await dbPool.executeQuery(query, values);
		return result[0].total;
	} catch (error) {
		throw new Error(`Error counting bookings: ${error.message}`);
	}
};

/**
 * Get bookings by user ID
 * @param {string} userId - User UUID
 * @param {number} limit - Results limit
 * @param {number} offset - Results offset
 * @returns {Promise<Array>} Array of user's bookings
 */
export const findByUserId = async (userId, limit = 10, offset = 0) => {
	return findByFilters({
		user_id: userId,
		limit,
		offset,
	});
};

/**
 * Get bookings by trip ID
 * @param {string} tripId - Trip UUID
 * @param {number} limit - Results limit
 * @param {number} offset - Results offset
 * @returns {Promise<Array>} Array of trip's bookings
 */
export const findByTripId = async (tripId, limit = 10, offset = 0) => {
	return findByFilters({
		trip_id: tripId,
		limit,
		offset,
	});
};

/**
 * Get booking statistics
 * @returns {Promise<Object>} Booking statistics
 */
export const getStatistics = async () => {
	const query = `
		SELECT 
			COUNT(*) as total_bookings,
			SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_bookings,
			SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed_bookings,
			SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_bookings,
			SUM(num_people) as total_people
		FROM bookings
	`;

	try {
		const result = await dbPool.executeQuery(query);
		return result[0];
	} catch (error) {
		throw new Error(`Error getting booking statistics: ${error.message}`);
	}
};

export default {
	findById,
	create,
	update,
	remove,
	findByFilters,
	countByFilters,
	findByUserId,
	findByTripId,
	getStatistics,
};
