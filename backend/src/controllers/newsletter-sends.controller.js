import SendsModel from "../models/newsletter-sends.model.js";
import { AppError } from "../middlewares/error.middleware.js";
import { setContentRange } from "../middlewares/content-range.middleware.js";
import { formatReactAdminList, formatReactAdminGetOne, formatReactAdminSave } from "../utils/response.formatter.js";
import { processBulkDelete, processBulkUpdate } from "../middlewares/bulk-operations.middleware.js";

/**
 * Get send by ID
 * Compatible with React Admin getOne
 */
export const getSendById = async (req, res, next) => {
	try {
		const send = await SendsModel.findById(req.params.id);
		if (!send) {
			throw new AppError("Send not found", 404);
		}

		// Format response for React Admin
		res.json(formatReactAdminGetOne(send));
	} catch (error) {
		next(error);
	}
};

/**
 * Update send status
 * Compatible with React Admin update
 */
export const updateSend = async (req, res, next) => {
	try {
		const { id } = req.params;
		const { status, sent_date } = req.body;

		const send = await SendsModel.findById(id);
		if (!send) {
			throw new AppError("Send not found", 404);
		}

		const updateData = {};
		if (status !== undefined) {
			if (!["pending", "sent", "failed"].includes(status)) {
				throw new AppError("Status must be 'pending', 'sent', or 'failed'", 400);
			}
			updateData.status = status;
		}
		if (sent_date !== undefined) updateData.sent_date = sent_date;

		if (Object.keys(updateData).length === 0) {
			throw new AppError("No data provided for update", 400);
		}

		const updated = await SendsModel.update(id, updateData);
		if (!updated) {
			throw new AppError("Failed to update send", 500);
		}

		const updatedSend = await SendsModel.findById(id);
		res.json(formatReactAdminSave(updatedSend));
	} catch (error) {
		next(error);
	}
};

/**
 * Mark send as sent
 */
export const markAsSent = async (req, res, next) => {
	try {
		const { id } = req.params;

		const send = await SendsModel.findById(id);
		if (!send) {
			throw new AppError("Send not found", 404);
		}

		if (send.status === "sent") {
			throw new AppError("Send is already marked as sent", 400);
		}

		const updated = await SendsModel.markAsSent(id);
		if (!updated) {
			throw new AppError("Failed to mark send as sent", 500);
		}

		const updatedSend = await SendsModel.findById(id);
		res.json({
			status: "success",
			message: "Send marked as sent",
			data: updatedSend,
		});
	} catch (error) {
		next(error);
	}
};

/**
 * Mark send as failed
 */
export const markAsFailed = async (req, res, next) => {
	try {
		const { id } = req.params;

		const send = await SendsModel.findById(id);
		if (!send) {
			throw new AppError("Send not found", 404);
		}

		if (send.status === "failed") {
			throw new AppError("Send is already marked as failed", 400);
		}

		const updated = await SendsModel.markAsFailed(id);
		if (!updated) {
			throw new AppError("Failed to mark send as failed", 500);
		}

		const updatedSend = await SendsModel.findById(id);
		res.json({
			status: "success",
			message: "Send marked as failed",
			data: updatedSend,
		});
	} catch (error) {
		next(error);
	}
};

/**
 * Retry failed send
 */
export const retrySend = async (req, res, next) => {
	try {
		const { id } = req.params;

		const send = await SendsModel.findById(id);
		if (!send) {
			throw new AppError("Send not found", 404);
		}

		if (send.status !== "failed") {
			throw new AppError("Only failed sends can be retried", 400);
		}

		// Reset to pending status
		const updated = await SendsModel.update(id, { status: "pending" });
		if (!updated) {
			throw new AppError("Failed to retry send", 500);
		}

		const updatedSend = await SendsModel.findById(id);
		res.json({
			status: "success",
			message: "Send marked for retry",
			data: updatedSend,
		});
	} catch (error) {
		next(error);
	}
};

/**
 * Delete send record
 * Compatible with React Admin delete
 */
export const deleteSend = async (req, res, next) => {
	try {
		const { id } = req.params;

		const send = await SendsModel.findById(id);
		if (!send) {
			throw new AppError("Send not found", 404);
		}

		const deleted = await SendsModel.remove(id);
		if (!deleted) {
			throw new AppError("Failed to delete send", 500);
		}

		res.json(formatReactAdminSave({ id }));
	} catch (error) {
		next(error);
	}
};

/**
 * Search sends with filtering, sorting, and pagination
 * Compatible with React Admin getList
 */
export const searchSends = async (req, res, next) => {
	try {
		// Use React Admin params if available, otherwise use standard query params
		const params = req.reactAdminParams || {};
		const filters = params.filters || {};
		const pagination = params.pagination || { offset: 0, limit: 10 };
		const sort = params.sort || { field: "created_at", order: "DESC" };

		// Map React Admin filters to our model's expected format
		const sends = await SendsModel.findByFilters({
			campaign_id: filters.campaign_id,
			subscriber_id: filters.subscriber_id,
			status: filters.status,
			language: filters.language,
			limit: pagination.limit,
			offset: pagination.offset,
			sortField: sort.field,
			sortOrder: sort.order,
		});

		// Get total count for pagination
		const count = await SendsModel.countByFilters({
			campaign_id: filters.campaign_id,
			subscriber_id: filters.subscriber_id,
			status: filters.status,
			language: filters.language,
		});

		// Set Content-Range header for React Admin
		setContentRange(req, res, count);

		// Format response for React Admin
		res.json(formatReactAdminList(sends, count));
	} catch (error) {
		next(error);
	}
};

/**
 * Bulk delete sends
 * Compatible with React Admin deleteMany
 */
export const bulkDeleteSends = async (req, res, next) => {
	try {
		const { ids } = req.body;

		// Use the bulk operation utility
		const result = await processBulkDelete(SendsModel.remove, ids);

		res.json({ data: ids });
	} catch (error) {
		next(error);
	}
};

/**
 * Bulk update sends
 * Compatible with React Admin updateMany
 */
export const bulkUpdateSends = async (req, res, next) => {
	try {
		const { ids, data } = req.body;

		// Validate status if it's being updated
		if (data.status && !["pending", "sent", "failed"].includes(data.status)) {
			throw new AppError("Status must be 'pending', 'sent', or 'failed'", 400);
		}

		// Use the bulk operation utility
		const result = await processBulkUpdate(SendsModel.update, ids, data);

		res.json({ data: ids });
	} catch (error) {
		next(error);
	}
};

/**
 * Get send statistics for a campaign
 */
export const getCampaignStats = async (req, res, next) => {
	try {
		const { campaignId } = req.params;

		const stats = await SendsModel.getCampaignStats(campaignId);

		res.json({
			status: "success",
			data: stats,
		});
	} catch (error) {
		next(error);
	}
};

/**
 * Get send statistics for a subscriber
 */
export const getSubscriberStats = async (req, res, next) => {
	try {
		const { subscriberId } = req.params;

		const sends = await SendsModel.findBySubscriberId(subscriberId);

		// Calculate statistics
		const stats = {
			total_sends: sends.length,
			successful_sends: sends.filter((s) => s.status === "sent").length,
			failed_sends: sends.filter((s) => s.status === "failed").length,
			pending_sends: sends.filter((s) => s.status === "pending").length,
		};

		res.json({
			status: "success",
			data: {
				statistics: stats,
				sends: sends,
			},
		});
	} catch (error) {
		next(error);
	}
};

export default {
	getSendById,
	updateSend,
	markAsSent,
	markAsFailed,
	retrySend,
	deleteSend,
	searchSends,
	bulkDeleteSends,
	bulkUpdateSends,
	getCampaignStats,
	getSubscriberStats,
};
