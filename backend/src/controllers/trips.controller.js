import tripModel from "../models/trip.model.js";
import tripTranslationsModel from "../models/trip.translations.model.js";
import tripImagesModel from "../models/trip.images.model.js";
import tripDatesModel from "../models/trip.dates.model.js";
import { formatResponse, formatErrorResponse } from "../utils/response.formatter.js";

/**
 * Get all trips with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getAllTrips = async (req, res) => {
	try {
		const {
			_start = 0,
			_end = 10,
			_sort = "created_at",
			_order = "DESC",
			language = "es",
			destination,
			trip_type,
			min_price,
			max_price,
			featured,
			q: search,
		} = req.query;

		const limit = parseInt(_end) - parseInt(_start);
		const offset = parseInt(_start);

		// Get trips with filters
		const trips = await tripModel.findByFilters({
			language,
			destination,
			trip_type,
			min_price,
			max_price,
			featured: featured === "true" ? true : featured === "false" ? false : undefined,
			search,
			limit,
			offset,
		});

		// Get total count for Content-Range header
		const total = await tripModel.countByFilters({
			language,
			destination,
			trip_type,
			min_price,
			max_price,
			featured: featured === "true" ? true : featured === "false" ? false : undefined,
			search,
		});

		// Set Content-Range header for React Admin
		res.set("Content-Range", `trips ${_start}-${Math.min(total, _end - 1)}/${total}`);
		res.set("X-Total-Count", total.toString());

		return formatResponse(res, trips);
	} catch (error) {
		return formatErrorResponse(res, error.message, 500);
	}
};

/**
 * Get trip by ID with translations
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getTripById = async (req, res) => {
	try {
		const { id } = req.params;
		const { language = "es" } = req.query;

		const trip = await tripModel.findById(id, language);

		if (!trip) {
			return formatErrorResponse(res, "Trip not found", 404);
		}

		// Get related trip images
		const images = await tripModel.getTripImages(id);

		// Get available dates
		const availableDates = await tripModel.getAvailableDates(id);

		// Add images and dates to response
		trip.images = images || [];
		trip.availableDates = availableDates || [];

		return formatResponse(res, trip);
	} catch (error) {
		return formatErrorResponse(res, error.message, 500);
	}
};

/**
 * Create new trip with translations
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const createTrip = async (req, res) => {
	try {
		const { destination, trip_type, price, featured, translations } = req.body;

		// Validate required fields
		if (!destination || !trip_type || !price || !translations || !translations.length) {
			return formatErrorResponse(res, "Missing required fields", 400);
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

		return formatResponse(res, trip, 201);
	} catch (error) {
		return formatErrorResponse(res, error.message, 500);
	}
};

/**
 * Update trip
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const updateTrip = async (req, res) => {
	try {
		const { id } = req.params;
		const { destination, trip_type, price, featured } = req.body;

		// Check if trip exists
		const existingTrip = await tripModel.findById(id);
		if (!existingTrip) {
			return formatErrorResponse(res, "Trip not found", 404);
		}

		// Update trip
		await tripModel.update(id, {
			destination,
			trip_type,
			price,
			featured,
		});

		// Get updated trip
		const updatedTrip = await tripModel.findById(id);

		return formatResponse(res, updatedTrip);
	} catch (error) {
		return formatErrorResponse(res, error.message, 500);
	}
};

/**
 * Update trip translation
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const updateTripTranslation = async (req, res) => {
	try {
		const { id } = req.params;
		const { language, title, description, itinerary } = req.body;

		if (!language || !title || !description || !itinerary) {
			return formatErrorResponse(res, "Missing required translation fields", 400);
		}

		// Check if trip exists
		const existingTrip = await tripModel.findById(id);
		if (!existingTrip) {
			return formatErrorResponse(res, "Trip not found", 404);
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

		return formatResponse(res, updatedTrip);
	} catch (error) {
		return formatErrorResponse(res, error.message, 500);
	}
};

/**
 * Delete trip
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const deleteTrip = async (req, res) => {
	try {
		const { id } = req.params;

		// Check if trip exists
		const existingTrip = await tripModel.findById(id);
		if (!existingTrip) {
			return formatErrorResponse(res, "Trip not found", 404);
		}

		// Delete trip (this should cascade delete translations, images, and dates)
		await tripModel.remove(id);

		return formatResponse(res, { message: "Trip deleted successfully" });
	} catch (error) {
		return formatErrorResponse(res, error.message, 500);
	}
};

/**
 * Add image to trip
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const addTripImage = async (req, res) => {
	try {
		const { id } = req.params;
		const { url, description } = req.body;

		if (!url) {
			return formatErrorResponse(res, "Image URL is required", 400);
		}

		// Check if trip exists
		const existingTrip = await tripModel.findById(id);
		if (!existingTrip) {
			return formatErrorResponse(res, "Trip not found", 404);
		}

		// Add image
		const imageId = await tripModel.addImage(id, url, description);

		// Get created image
		const image = await tripImagesModel.findById(imageId);

		return formatResponse(res, image, 201);
	} catch (error) {
		return formatErrorResponse(res, error.message, 500);
	}
};

/**
 * Add available date to trip
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const addAvailableDate = async (req, res) => {
	try {
		const { id } = req.params;
		const { start_date, end_date, spots_available, price_modifier = 0 } = req.body;

		if (!start_date || !end_date || spots_available === undefined) {
			return formatErrorResponse(res, "Missing required fields for available date", 400);
		}

		// Check if trip exists
		const existingTrip = await tripModel.findById(id);
		if (!existingTrip) {
			return formatErrorResponse(res, "Trip not found", 404);
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

		return formatResponse(res, availableDate, 201);
	} catch (error) {
		return formatErrorResponse(res, error.message, 500);
	}
};

/**
 * Get trip images
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getTripImages = async (req, res) => {
	try {
		const { id } = req.params;

		// Check if trip exists
		const existingTrip = await tripModel.findById(id);
		if (!existingTrip) {
			return formatErrorResponse(res, "Trip not found", 404);
		}

		// Get images
		const images = await tripModel.getTripImages(id);

		return formatResponse(res, images);
	} catch (error) {
		return formatErrorResponse(res, error.message, 500);
	}
};

/**
 * Get trip available dates
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getTripDates = async (req, res) => {
	try {
		const { id } = req.params;

		// Check if trip exists
		const existingTrip = await tripModel.findById(id);
		if (!existingTrip) {
			return formatErrorResponse(res, "Trip not found", 404);
		}

		// Get available dates
		const dates = await tripModel.getAvailableDates(id);

		return formatResponse(res, dates);
	} catch (error) {
		return formatErrorResponse(res, error.message, 500);
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
};
