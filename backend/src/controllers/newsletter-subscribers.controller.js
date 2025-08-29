import SubscribersModel from "../models/newsletter-subscribers.model.js";
import { AppError } from "../middlewares/error.middleware.js";
import { setContentRange } from "../middlewares/content-range.middleware.js";
import { formatReactAdminList, formatReactAdminGetOne, formatReactAdminSave } from "../utils/response.formatter.js";
import { processBulkDelete, processBulkUpdate } from "../middlewares/bulk-operations.middleware.js";

/**
 * Get subscriber by ID
 * Compatible with React Admin getOne
 */
export const getSubscriberById = async (req, res, next) => {
	try {
		const subscriber = await SubscribersModel.findById(req.params.id);
		if (!subscriber) {
			throw new AppError("Subscriber not found", 404);
		}

		// Format response for React Admin
		res.json(formatReactAdminGetOne(subscriber));
	} catch (error) {
		next(error);
	}
};

/**
 * Create new subscriber
 * Compatible with React Admin create
 */
export const createSubscriber = async (req, res, next) => {
	try {
		const { email, preferred_language = "es" } = req.body;

		if (!email) {
			throw new AppError("Email is required", 400);
		}

		const subscriberId = await SubscribersModel.create({ email, preferred_language });
		const subscriber = await SubscribersModel.findById(subscriberId);

		res.status(201).json(formatReactAdminSave(subscriber));
	} catch (error) {
		if (error.message === "Email already subscribed") {
			next(new AppError("Email already subscribed", 400));
		} else {
			next(error);
		}
	}
};

/**
 * Update subscriber
 * Compatible with React Admin update
 */
export const updateSubscriber = async (req, res, next) => {
	try {
		const { id } = req.params;
		const { email, preferred_language, status } = req.body;

		const subscriber = await SubscribersModel.findById(id);
		if (!subscriber) {
			throw new AppError("Subscriber not found", 404);
		}

		const updateData = {};
		if (email !== undefined) updateData.email = email;
		if (preferred_language !== undefined) updateData.preferred_language = preferred_language;
		if (status !== undefined) updateData.status = status;

		if (Object.keys(updateData).length === 0) {
			throw new AppError("No data provided for update", 400);
		}

		const updated = await SubscribersModel.update(id, updateData);
		if (!updated) {
			throw new AppError("Failed to update subscriber", 500);
		}

		const updatedSubscriber = await SubscribersModel.findById(id);
		res.json(formatReactAdminSave(updatedSubscriber));
	} catch (error) {
		next(error);
	}
};

/**
 * Delete subscriber
 * Compatible with React Admin delete
 */
export const deleteSubscriber = async (req, res, next) => {
	try {
		const { id } = req.params;

		const subscriber = await SubscribersModel.findById(id);
		if (!subscriber) {
			throw new AppError("Subscriber not found", 404);
		}

		const deleted = await SubscribersModel.remove(id);
		if (!deleted) {
			throw new AppError("Failed to delete subscriber", 500);
		}

		res.json(formatReactAdminSave({ id }));
	} catch (error) {
		next(error);
	}
};

/**
 * Search subscribers with filtering, sorting, and pagination
 * Compatible with React Admin getList
 */
export const searchSubscribers = async (req, res, next) => {
	try {
		// Use React Admin params if available, otherwise use standard query params
		const params = req.reactAdminParams || {};
		const filters = params.filters || {};
		const pagination = params.pagination || { offset: 0, limit: 10 };
		const sort = params.sort || { field: "subscription_date", order: "DESC" };

		// Map React Admin filters to our model's expected format
		const subscribers = await SubscribersModel.findByFilters({
			status: filters.status,
			preferred_language: filters.preferred_language,
			search: params.search || filters.q,
			limit: pagination.limit,
			offset: pagination.offset,
			sortField: sort.field,
			sortOrder: sort.order,
		});

		// Get total count for pagination
		const count = await SubscribersModel.countByFilters({
			status: filters.status,
			preferred_language: filters.preferred_language,
			search: params.search || filters.q,
		});

		// Set Content-Range header for React Admin
		setContentRange(req, res, count);

		// Format response for React Admin
		res.json(formatReactAdminList(subscribers, count));
	} catch (error) {
		next(error);
	}
};

/**
 * Bulk delete subscribers
 * Compatible with React Admin deleteMany
 */
export const bulkDeleteSubscribers = async (req, res, next) => {
	try {
		const { ids } = req.body;

		// Use the bulk operation utility
		const result = await processBulkDelete(SubscribersModel.remove, ids);

		res.json({ data: ids });
	} catch (error) {
		next(error);
	}
};

/**
 * Bulk update subscribers
 * Compatible with React Admin updateMany
 */
export const bulkUpdateSubscribers = async (req, res, next) => {
	try {
		const { ids, data } = req.body;

		// Use the bulk operation utility
		const result = await processBulkUpdate(SubscribersModel.update, ids, data);

		res.json({ data: ids });
	} catch (error) {
		next(error);
	}
};

/**
 * Public subscribe endpoint
 * For use in public newsletter signup forms
 */
export const subscribe = async (req, res, next) => {
	try {
		const { email, preferred_language = "es" } = req.body;

		if (!email) {
			throw new AppError("Email is required", 400);
		}

		await SubscribersModel.create({ email, preferred_language });

		res.status(201).json({
			status: "success",
			message: "Successfully subscribed to newsletter",
		});
	} catch (error) {
		if (error.message === "Email already subscribed") {
			res.json({
				status: "success",
				message: "Already subscribed to newsletter",
			});
		} else {
			next(error);
		}
	}
};

/**
 * Public unsubscribe endpoint
 * For use in newsletter unsubscribe links
 */
export const unsubscribe = async (req, res, next) => {
	try {
		const { email } = req.body;

		if (!email) {
			throw new AppError("Email is required", 400);
		}

		await SubscribersModel.unsubscribe(email);

		res.json({
			status: "success",
			message: "Successfully unsubscribed from newsletter",
		});
	} catch (error) {
		next(error);
	}
};

export default {
	getSubscriberById,
	createSubscriber,
	updateSubscriber,
	deleteSubscriber,
	searchSubscribers,
	bulkDeleteSubscribers,
	bulkUpdateSubscribers,
	subscribe,
	unsubscribe,
};

