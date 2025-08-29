import CampaignsModel from "../models/newsletter-campaigns.model.js";
import SubscribersModel from "../models/newsletter-subscribers.model.js";
import SendsModel from "../models/newsletter-sends.model.js";
import { AppError } from "../middlewares/error.middleware.js";
import { setContentRange } from "../middlewares/content-range.middleware.js";
import { formatReactAdminList, formatReactAdminGetOne, formatReactAdminSave } from "../utils/response.formatter.js";
import { processBulkDelete, processBulkUpdate } from "../middlewares/bulk-operations.middleware.js";

/**
 * Get campaign by ID
 * Compatible with React Admin getOne
 */
export const getCampaignById = async (req, res, next) => {
	try {
		const campaign = await CampaignsModel.findById(req.params.id);
		if (!campaign) {
			throw new AppError("Campaign not found", 404);
		}

		// Format response for React Admin
		res.json(formatReactAdminGetOne(campaign));
	} catch (error) {
		next(error);
	}
};

/**
 * Create new campaign
 * Compatible with React Admin create
 */
export const createCampaign = async (req, res, next) => {
	try {
		const { language, subject, content } = req.body;

		if (!language || !subject || !content) {
			throw new AppError("Language, subject, and content are required", 400);
		}

		// Validate language code
		if (!["es", "en"].includes(language)) {
			throw new AppError("Language must be 'es' or 'en'", 400);
		}

		const campaignId = await CampaignsModel.create({ language, subject, content });
		const campaign = await CampaignsModel.findById(campaignId);

		res.status(201).json(formatReactAdminSave(campaign));
	} catch (error) {
		next(error);
	}
};

/**
 * Update campaign data
 * Compatible with React Admin update
 */
export const updateCampaign = async (req, res, next) => {
	try {
		const { id } = req.params;
		const { language, subject, content } = req.body;

		const campaign = await CampaignsModel.findById(id);
		if (!campaign) {
			throw new AppError("Campaign not found", 404);
		}

		// Don't allow updates to sent campaigns
		if (campaign.sent_date) {
			throw new AppError("Cannot update a campaign that has already been sent", 400);
		}

		const updateData = {};
		if (language !== undefined) {
			if (!["es", "en"].includes(language)) {
				throw new AppError("Language must be 'es' or 'en'", 400);
			}
			updateData.language = language;
		}
		if (subject !== undefined) updateData.subject = subject;
		if (content !== undefined) updateData.content = content;

		if (Object.keys(updateData).length === 0) {
			throw new AppError("No data provided for update", 400);
		}

		const updated = await CampaignsModel.update(id, updateData);
		if (!updated) {
			throw new AppError("Failed to update campaign", 500);
		}

		const updatedCampaign = await CampaignsModel.findById(id);
		res.json(formatReactAdminSave(updatedCampaign));
	} catch (error) {
		next(error);
	}
};

/**
 * Delete campaign
 * Compatible with React Admin delete
 */
export const deleteCampaign = async (req, res, next) => {
	try {
		const { id } = req.params;

		const campaign = await CampaignsModel.findById(id);
		if (!campaign) {
			throw new AppError("Campaign not found", 404);
		}

		// Don't allow deletion of sent campaigns
		if (campaign.sent_date) {
			throw new AppError("Cannot delete a campaign that has already been sent", 400);
		}

		const deleted = await CampaignsModel.remove(id);
		if (!deleted) {
			throw new AppError("Failed to delete campaign", 500);
		}

		res.json(formatReactAdminSave({ id }));
	} catch (error) {
		next(error);
	}
};

/**
 * Search campaigns with filtering, sorting, and pagination
 * Compatible with React Admin getList
 */
export const searchCampaigns = async (req, res, next) => {
	try {
		// Use React Admin params if available, otherwise use standard query params
		const params = req.reactAdminParams || {};
		const filters = params.filters || {};
		const pagination = params.pagination || { offset: 0, limit: 10 };
		const sort = params.sort || { field: "created_at", order: "DESC" };

		// Map React Admin filters to our model's expected format
		const campaigns = await CampaignsModel.findByFilters({
			language: filters.language,
			sent: filters.sent !== undefined ? filters.sent === "true" : undefined,
			search: params.search || filters.q,
			limit: pagination.limit,
			offset: pagination.offset,
			sortField: sort.field,
			sortOrder: sort.order,
		});

		// Get total count for pagination
		const count = await CampaignsModel.countByFilters({
			language: filters.language,
			sent: filters.sent !== undefined ? filters.sent === "true" : undefined,
			search: params.search || filters.q,
		});

		// Set Content-Range header for React Admin
		setContentRange(req, res, count);

		// Format response for React Admin
		res.json(formatReactAdminList(campaigns, count));
	} catch (error) {
		next(error);
	}
};

/**
 * Bulk delete campaigns
 * Compatible with React Admin deleteMany
 */
export const bulkDeleteCampaigns = async (req, res, next) => {
	try {
		const { ids } = req.body;

		// Check if any of the campaigns have been sent
		for (const id of ids) {
			const campaign = await CampaignsModel.findById(id);
			if (campaign && campaign.sent_date) {
				throw new AppError(`Cannot delete campaign ${id} as it has already been sent`, 400);
			}
		}

		// Use the bulk operation utility
		const result = await processBulkDelete(CampaignsModel.remove, ids);

		res.json({ data: ids });
	} catch (error) {
		next(error);
	}
};

/**
 * Bulk update campaigns
 * Compatible with React Admin updateMany
 */
export const bulkUpdateCampaigns = async (req, res, next) => {
	try {
		const { ids, data } = req.body;

		// Check if any of the campaigns have been sent
		for (const id of ids) {
			const campaign = await CampaignsModel.findById(id);
			if (campaign && campaign.sent_date) {
				throw new AppError(`Cannot update campaign ${id} as it has already been sent`, 400);
			}
		}

		// Validate language if it's being updated
		if (data.language && !["es", "en"].includes(data.language)) {
			throw new AppError("Language must be 'es' or 'en'", 400);
		}

		// Use the bulk operation utility
		const result = await processBulkUpdate(CampaignsModel.update, ids, data);

		res.json({ data: ids });
	} catch (error) {
		next(error);
	}
};

/**
 * Send campaign to all active subscribers with matching language preference
 */
export const sendCampaign = async (req, res, next) => {
	try {
		const { id } = req.params;

		const campaign = await CampaignsModel.findById(id);
		if (!campaign) {
			throw new AppError("Campaign not found", 404);
		}

		if (campaign.sent_date) {
			throw new AppError("Campaign has already been sent", 400);
		}

		// Get all active subscribers with matching language preference
		const subscribers = await SubscribersModel.getActiveByLanguage(campaign.language);

		if (subscribers.length === 0) {
			throw new AppError(`No active subscribers found for language: ${campaign.language}`, 400);
		}

		// Create send records for each subscriber
		const subscriberIds = subscribers.map((sub) => sub.id);
		const sendIds = await SendsModel.createBulk(id, subscriberIds);

		// TODO: Implement actual email sending logic here using Nodemailer
		// For now, we'll mark all sends as sent and update the campaign
		for (const sendId of sendIds) {
			await SendsModel.markAsSent(sendId);
		}

		// Mark campaign as sent
		await CampaignsModel.markAsSent(id);

		res.json({
			status: "success",
			message: `Campaign sent to ${subscribers.length} subscribers`,
			data: {
				campaignId: id,
				subscribersCount: subscribers.length,
				language: campaign.language,
			},
		});
	} catch (error) {
		next(error);
	}
};

/**
 * Get campaign sends (tracking information)
 */
export const getCampaignSends = async (req, res, next) => {
	try {
		const { id } = req.params;

		const campaign = await CampaignsModel.findById(id);
		if (!campaign) {
			throw new AppError("Campaign not found", 404);
		}

		// Get all sends for this campaign
		const sends = await SendsModel.findByCampaignId(id);

		// Get campaign statistics
		const stats = await SendsModel.getCampaignStats(id);

		res.json({
			status: "success",
			data: {
				campaign,
				sends,
				statistics: stats,
			},
		});
	} catch (error) {
		next(error);
	}
};

export default {
	getCampaignById,
	createCampaign,
	updateCampaign,
	deleteCampaign,
	searchCampaigns,
	bulkDeleteCampaigns,
	bulkUpdateCampaigns,
	sendCampaign,
	getCampaignSends,
};
