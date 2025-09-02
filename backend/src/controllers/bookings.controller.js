import BookingModel from "../models/booking.model.js";
import { AppError } from "../middlewares/error.middleware.js";
import { setContentRange } from "../middlewares/content-range.middleware.js";
import { formatReactAdminList, formatReactAdminGetOne, formatReactAdminSave } from "../utils/response.formatter.js";
import { processBulkDelete, processBulkUpdate } from "../middlewares/bulk-operations.middleware.js";

/**
 * Get booking by ID
 * Compatible with React Admin getOne
 */
export const getBookingById = async (req, res, next) => {
	try {
		const booking = await BookingModel.findById(req.params.id);
		if (!booking) {
			throw new AppError("Booking not found", 404);
		}

		// Format response for React Admin
		res.json(formatReactAdminGetOne(booking));
	} catch (error) {
		next(error);
	}
};

/**
 * Create new booking
 * Compatible with React Admin create
 */
export const createBooking = async (req, res, next) => {
	try {
		const bookingId = await BookingModel.create(req.body);

		// Get the created booking to return full object (React Admin expects the full resource)
		const booking = await BookingModel.findById(bookingId);

		res.status(201).json(formatReactAdminSave(booking));
	} catch (error) {
		if (error.message.includes("No availability found") || error.message.includes("Not enough spots available")) {
			next(new AppError(error.message, 400));
		} else {
			next(error);
		}
	}
};

/**
 * Update booking
 * Compatible with React Admin update
 */
export const updateBooking = async (req, res, next) => {
	try {
		const { id } = req.params;
		const updated = await BookingModel.update(id, req.body);

		if (!updated) {
			throw new AppError("Booking not found or no changes made", 404);
		}

		// Get the updated booking to return full object
		const booking = await BookingModel.findById(id);

		res.json(formatReactAdminSave(booking));
	} catch (error) {
		if (error.message.includes("No availability found") || error.message.includes("Not enough spots available")) {
			next(new AppError(error.message, 400));
		} else {
			next(error);
		}
	}
};

/**
 * Delete booking
 * Compatible with React Admin delete
 */
export const deleteBooking = async (req, res, next) => {
	try {
		const { id } = req.params;

		// Get booking before deletion for the response
		const booking = await BookingModel.findById(id);

		if (!booking) {
			throw new AppError("Booking not found", 404);
		}

		const deleted = await BookingModel.remove(id);

		if (!deleted) {
			throw new AppError("Failed to delete booking", 500);
		}

		res.json(formatReactAdminSave({ id }));
	} catch (error) {
		next(error);
	}
};

/**
 * Search bookings with filters, sorting, and pagination
 * Compatible with React Admin getList
 */
export const searchBookings = async (req, res, next) => {
	try {
		// Use React Admin params if available, otherwise use standard query params
		const params = req.reactAdminParams || {};
		const filters = params.filters || {};
		const pagination = params.pagination || { offset: 0, limit: 10 };
		const sort = params.sort || { field: "booking_date", order: "DESC" };

		// Map React Admin filters to our model's expected format
		const bookings = await BookingModel.findByFilters({
			user_id: filters.user_id,
			trip_id: filters.trip_id,
			status: filters.status,
			start_date: filters.start_date,
			end_date: filters.end_date,
			limit: pagination.limit,
			offset: pagination.offset,
			sortField: sort.field,
			sortOrder: sort.order,
		});

		// Get total count for pagination
		const count = await BookingModel.countByFilters({
			user_id: filters.user_id,
			trip_id: filters.trip_id,
			status: filters.status,
			start_date: filters.start_date,
			end_date: filters.end_date,
		});

		// Set Content-Range header for React Admin
		setContentRange(req, res, count);

		// Format response for React Admin
		res.json(formatReactAdminList(bookings, count));
	} catch (error) {
		next(error);
	}
};

/**
 * Get bookings for a specific user
 * For user dashboard or profile page
 */
export const getUserBookings = async (req, res, next) => {
	try {
		const userId = req.params.userId || req.user.id; // Use authenticated user if no userId provided
		const limit = parseInt(req.query.limit) || 10;
		const offset = parseInt(req.query.offset) || 0;

		const bookings = await BookingModel.findByUserId(userId, limit, offset);
		const count = await BookingModel.countByFilters({ user_id: userId });

		// Format response
		res.json({
			status: "success",
			data: bookings,
			total: count,
			pagination: {
				limit,
				offset,
				total: count,
			},
		});
	} catch (error) {
		next(error);
	}
};

/**
 * Get bookings for a specific trip
 * For trip management or availability calculation
 */
export const getTripBookings = async (req, res, next) => {
	try {
		const tripId = req.params.tripId;
		const limit = parseInt(req.query.limit) || 10;
		const offset = parseInt(req.query.offset) || 0;

		const bookings = await BookingModel.findByTripId(tripId, limit, offset);
		const count = await BookingModel.countByFilters({ trip_id: tripId });

		// Format response
		res.json({
			status: "success",
			data: bookings,
			total: count,
			pagination: {
				limit,
				offset,
				total: count,
			},
		});
	} catch (error) {
		next(error);
	}
};

/**
 * Get booking statistics
 * For admin dashboard
 */
export const getBookingStatistics = async (req, res, next) => {
	try {
		const statistics = await BookingModel.getStatistics();

		res.json({
			status: "success",
			data: statistics,
		});
	} catch (error) {
		next(error);
	}
};

/**
 * Change booking status
 * Dedicated endpoint for status changes (confirm/cancel)
 */
export const changeBookingStatus = async (req, res, next) => {
	try {
		const { id } = req.params;
		const { status } = req.body;

		if (!["pending", "confirmed", "cancelled"].includes(status)) {
			throw new AppError("Invalid status. Must be 'pending', 'confirmed', or 'cancelled'", 400);
		}

		const updated = await BookingModel.update(id, { status });

		if (!updated) {
			throw new AppError("Booking not found or no changes made", 404);
		}

		// Get the updated booking to return full object
		const booking = await BookingModel.findById(id);

		res.json({
			status: "success",
			data: booking,
			message: `Booking status changed to ${status}`,
		});
	} catch (error) {
		next(error);
	}
};

/**
 * Bulk delete bookings
 * Compatible with React Admin deleteMany
 */
export const bulkDeleteBookings = async (req, res, next) => {
	try {
		const { ids } = req.body;

		// Use the bulk operation utility
		const result = await processBulkDelete(BookingModel.remove, ids);

		res.json({ data: ids });
	} catch (error) {
		next(error);
	}
};

/**
 * Bulk update bookings
 * Compatible with React Admin updateMany
 */
export const bulkUpdateBookings = async (req, res, next) => {
	try {
		const { ids, data } = req.body;

		// Use the bulk operation utility
		const result = await processBulkUpdate(BookingModel.update, ids, data);

		res.json({ data: ids });
	} catch (error) {
		next(error);
	}
};

export default {
	getBookingById,
	createBooking,
	updateBooking,
	deleteBooking,
	searchBookings,
	getUserBookings,
	getTripBookings,
	getBookingStatistics,
	changeBookingStatus,
	bulkDeleteBookings,
	bulkUpdateBookings,
};
