import tripModel from "../models/trip.model.js";
import tripTranslationsModel from "../models/trip.translations.model.js";
import tripImagesModel from "../models/trip.images.model.js";
import tripDatesModel from "../models/trip.dates.model.js";
import { AppError } from "../middlewares/error.middleware.js";
import { setContentRange } from "../middlewares/content-range.middleware.js";
import { formatReactAdminList, formatReactAdminGetOne, formatReactAdminSave } from "../utils/response.formatter.js";
import { processBulkDelete, processBulkUpdate } from "../middlewares/bulk-operations.middleware.js";

/**
 * Get all trips with pagination and filtering
 * Compatible with React Admin getList
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const getAllTrips = async (req, res, next) => {
	try {
		// Use React Admin params if available, otherwise use standard query params
		const params = req.reactAdminParams || {};
		const filters = params.filters || {};
		const pagination = params.pagination || { offset: 0, limit: 10 };
		const sort = params.sort || { field: "created_at", order: "DESC" };
		const language = filters.language || req.query.language || "es";

		// Get trips with filters
		const trips = await tripModel.findByFilters({
			language,
			destination: filters.destination,
			trip_type: filters.trip_type,
			min_price: filters.min_price,
			max_price: filters.max_price,
			featured: filters.featured === "true" ? true : filters.featured === "false" ? false : undefined,
			search: params.search || filters.q,
			limit: pagination.limit,
			offset: pagination.offset,
			sortField: sort.field,
			sortOrder: sort.order,
		});

		// Get total count for Content-Range header
		const total = await tripModel.countByFilters({
			language,
			destination: filters.destination,
			trip_type: filters.trip_type,
			min_price: filters.min_price,
			max_price: filters.max_price,
			featured: filters.featured === "true" ? true : filters.featured === "false" ? false : undefined,
			search: params.search || filters.q,
		});

		// Set Content-Range header for React Admin
		setContentRange(req, res, total);

		// Format response for React Admin
		res.json(formatReactAdminList(trips, total));
	} catch (error) {
		next(error);
	}
};

/**
 * Get trip by ID with translations
 * Compatible with React Admin getOne
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const getTripById = async (req, res, next) => {
	try {
		const { id } = req.params;
		const { language = "es" } = req.query;

		const trip = await tripModel.findById(id, language);

		if (!trip) {
			throw new AppError("Trip not found", 404);
		}

		// Get related trip images
		const images = await tripModel.getTripImages(id);

		// Get available dates
		const availableDates = await tripModel.getAvailableDates(id);

		// Add images and dates to response
		trip.images = images || [];
		trip.availableDates = availableDates || [];

		// Format response for React Admin
		res.json(formatReactAdminGetOne(trip));
	} catch (error) {
		next(error);
	}
};

/**
 * Create new trip with translations
 * Compatible with React Admin create
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const createTrip = async (req, res, next) => {
	try {
		const { destination, trip_type, price, featured, translations } = req.body;

		// Validate required fields
		if (!destination || !trip_type || !price || !translations || !translations.length) {
			throw new AppError("Missing required fields", 400);
		}

		// Get user ID from authenticated user
		const created_by = req.user.id;

		// Create trip with translations
		const tripId = await tripModel.create({
			destination,
			trip_type,
			price,
			featured,
			created_by,
			translations,
		});

		// Get created trip with translations
		const trip = await tripModel.findById(tripId, translations[0].language);

		// Get related trip images and dates
		const images = await tripModel.getTripImages(tripId);
		const availableDates = await tripModel.getAvailableDates(tripId);

		trip.images = images || [];
		trip.availableDates = availableDates || [];

		res.status(201).json(formatReactAdminSave(trip));
	} catch (error) {
		next(error);
	}
};

/**
 * Update trip
 * Compatible with React Admin update
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const updateTrip = async (req, res, next) => {
	try {
		const { id } = req.params;
		const { destination, trip_type, price, featured, translations } = req.body;

		// Check if trip exists
		const existingTrip = await tripModel.findById(id);
		if (!existingTrip) {
			throw new AppError("Trip not found", 404);
		}

		// Update trip basic data
		const tripData = {};
		if (destination !== undefined) tripData.destination = destination;
		if (trip_type !== undefined) tripData.trip_type = trip_type;
		if (price !== undefined) tripData.price = price;
		if (featured !== undefined) tripData.featured = featured;

		if (Object.keys(tripData).length > 0) {
			await tripModel.update(id, tripData);
		}

		// Update translations if provided
		if (translations && Array.isArray(translations)) {
			for (const translation of translations) {
				await tripModel.updateTranslation(id, translation);
			}
		}

		// Get updated trip
		const updatedTrip = await tripModel.findById(id);

		// Get related trip images and dates
		const images = await tripModel.getTripImages(id);
		const availableDates = await tripModel.getAvailableDates(id);

		updatedTrip.images = images || [];
		updatedTrip.availableDates = availableDates || [];

		res.json(formatReactAdminSave(updatedTrip));
	} catch (error) {
		next(error);
	}
};

/**
 * Update trip translation
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const updateTripTranslation = async (req, res, next) => {
	try {
		const { id } = req.params;
		const { language, title, description, itinerary } = req.body;

		if (!language || !title || !description || !itinerary) {
			throw new AppError("Missing required translation fields", 400);
		}

		// Check if trip exists
		const existingTrip = await tripModel.findById(id);
		if (!existingTrip) {
			throw new AppError("Trip not found", 404);
		}

		// Update translation
		await tripModel.updateTranslation(id, {
			language,
			title,
			description,
			itinerary,
		});

		// Get updated trip with translation
		const updatedTrip = await tripModel.findById(id, language);

		res.json(formatReactAdminSave(updatedTrip));
	} catch (error) {
		next(error);
	}
};

/**
 * Delete trip
 * Compatible with React Admin delete
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const deleteTrip = async (req, res, next) => {
	try {
		const { id } = req.params;

		// Check if trip exists
		const existingTrip = await tripModel.findById(id);
		if (!existingTrip) {
			throw new AppError("Trip not found", 404);
		}

		// Delete trip (this should cascade delete translations, images, and dates)
		const deleted = await tripModel.remove(id);

		if (!deleted) {
			throw new AppError("Failed to delete trip", 500);
		}

		res.json(formatReactAdminSave({ id }));
	} catch (error) {
		next(error);
	}
};

/**
 * Add image to trip
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const addTripImage = async (req, res, next) => {
	try {
		const { id } = req.params;
		const { url, description, is_primary } = req.body;

		if (!url) {
			throw new AppError("Image URL is required", 400);
		}

		// Check if trip exists
		const existingTrip = await tripModel.findById(id);
		if (!existingTrip) {
			throw new AppError("Trip not found", 404);
		}

		// Add image
		const imageId = await tripModel.addImage(id, url, description, is_primary);

		// Get created image
		const image = await tripImagesModel.findById(imageId);

		res.status(201).json(formatReactAdminSave(image));
	} catch (error) {
		next(error);
	}
};

/**
 * Add available date to trip
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const addAvailableDate = async (req, res, next) => {
	try {
		const { id } = req.params;
		const { start_date, end_date, spots_available, price_modifier = 0 } = req.body;

		if (!start_date || !end_date || spots_available === undefined) {
			throw new AppError("Missing required fields for available date", 400);
		}

		// Check if trip exists
		const existingTrip = await tripModel.findById(id);
		if (!existingTrip) {
			throw new AppError("Trip not found", 404);
		}

		// Add available date
		const dateId = await tripModel.addAvailableDate(id, {
			start_date,
			end_date,
			spots_available,
			price_modifier,
		});

		// Get created date
		const availableDate = await tripDatesModel.findById(dateId);

		res.status(201).json(formatReactAdminSave(availableDate));
	} catch (error) {
		next(error);
	}
};

/**
 * Get trip images
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const getTripImages = async (req, res, next) => {
	try {
		const { id } = req.params;

		// Check if trip exists
		const existingTrip = await tripModel.findById(id);
		if (!existingTrip) {
			throw new AppError("Trip not found", 404);
		}

		// Get images
		const images = await tripModel.getTripImages(id);

		res.json(formatReactAdminList(images, images.length));
	} catch (error) {
		next(error);
	}
};

/**
 * Get trip available dates
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const getTripDates = async (req, res, next) => {
	try {
		const { id } = req.params;

		// Check if trip exists
		const existingTrip = await tripModel.findById(id);
		if (!existingTrip) {
			throw new AppError("Trip not found", 404);
		}

		// Get available dates
		const dates = await tripModel.getAvailableDates(id);

		res.json(formatReactAdminList(dates, dates.length));
	} catch (error) {
		next(error);
	}
};

/**
 * Bulk delete trips
 * Compatible with React Admin deleteMany
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const bulkDeleteTrips = async (req, res, next) => {
	try {
		const { ids } = req.body;

		// Use the bulk operation utility
		const result = await processBulkDelete(tripModel.remove, ids);

		res.json({ data: ids });
	} catch (error) {
		next(error);
	}
};

/**
 * Bulk update trips
 * Compatible with React Admin updateMany
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const bulkUpdateTrips = async (req, res, next) => {
	try {
		const { ids, data } = req.body;

		// Use the bulk operation utility
		const result = await processBulkUpdate(tripModel.update, ids, data);

		res.json({ data: ids });
	} catch (error) {
		next(error);
	}
};

export default {
	getAllTrips,
	getTripById,
	createTrip,
	updateTrip,
	updateTripTranslation,
	deleteTrip,
	addTripImage,
	addAvailableDate,
	getTripImages,
	getTripDates,
	bulkDeleteTrips,
	bulkUpdateTrips,
};
