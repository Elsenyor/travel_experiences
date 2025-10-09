import faqModel from "../models/faq.model.js";
import { AppError } from "../middlewares/error.middleware.js";
import { setContentRange } from "../middlewares/content-range.middleware.js";
import { formatReactAdminList, formatReactAdminGetOne, formatReactAdminSave } from "../utils/response.formatter.js";
import { processBulkDelete, processBulkUpdate } from "../middlewares/bulk-operations.middleware.js";

/**
 * Get all FAQs with pagination and filtering
 * Compatible with React Admin getList
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const getAllFaqs = async (req, res, next) => {
	try {
		// Use React Admin params if available, otherwise use standard query params
		const params = req.reactAdminParams || {};
		const filters = params.filters || {};
		const pagination = params.pagination || { offset: 0, limit: 10 };
		const sort = params.sort || { field: "created_at", order: "DESC" };
		const language = filters.language || req.query.language || "es";

		// Get FAQs with filters
		const faqs = await faqModel.findAll({
			language,
			search: params.search || filters.q,
			limit: pagination.limit,
			offset: pagination.offset,
			sortField: sort.field,
			sortOrder: sort.order,
		});

		// Get total count for Content-Range header
		const total = await faqModel.countAll({
			language,
			search: params.search || filters.q,
		});

		// Set Content-Range header for React Admin
		setContentRange(req, res, total);

		// Format response for React Admin
		res.json(formatReactAdminList(faqs, total));
	} catch (error) {
		next(error);
	}
};

/**
 * Get FAQ by ID with translations
 * Compatible with React Admin getOne
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const getFaqById = async (req, res, next) => {
	try {
		const { id } = req.params;
		const { language = "es" } = req.query;

		const faq = await faqModel.findById(id, language);

		if (!faq) {
			throw new AppError("FAQ not found", 404);
		}

		// Get all translations
		const translations = await faqModel.getTranslations(id);

		// Add translations to response
		faq.translations = translations;

		// Format response for React Admin
		res.json(formatReactAdminGetOne(faq));
	} catch (error) {
		next(error);
	}
};

/**
 * Create new FAQ with translations
 * Compatible with React Admin create
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const createFaq = async (req, res, next) => {
	try {
		const { translations, order_position } = req.body;

		// Validate required fields
		if (!translations || !translations.length) {
			throw new AppError("At least one translation is required", 400);
		}

		// Create FAQ with translations
		const faqId = await faqModel.create({
			translations,
			order_position,
		});

		// Get created FAQ with translations
		const faq = await faqModel.findById(faqId, translations[0].language);

		// Get all translations
		const allTranslations = await faqModel.getTranslations(faqId);

		// Add translations to response
		faq.translations = allTranslations;

		res.status(201).json(formatReactAdminSave(faq));
	} catch (error) {
		next(error);
	}
};

/**
 * Update FAQ
 * Compatible with React Admin update
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const updateFaq = async (req, res, next) => {
	try {
		const { id } = req.params;
		const { translations, order_position } = req.body;

		// Check if FAQ exists
		const existingFaq = await faqModel.findById(id);
		if (!existingFaq) {
			throw new AppError("FAQ not found", 404);
		}

		// Update FAQ basic data if provided
		const faqData = {};
		if (order_position !== undefined) faqData.order_position = order_position;

		if (Object.keys(faqData).length > 0) {
			await faqModel.update(id, faqData);
		}

		// Update translations if provided
		if (translations && Array.isArray(translations)) {
			for (const translation of translations) {
				await faqModel.updateTranslation(id, translation);
			}
		}

		// Get updated FAQ
		const updatedFaq = await faqModel.findById(id);

		// Get all translations
		const allTranslations = await faqModel.getTranslations(id);

		// Add translations to response
		updatedFaq.translations = allTranslations;

		res.json(formatReactAdminSave(updatedFaq));
	} catch (error) {
		next(error);
	}
};

/**
 * Update FAQ translation
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const updateFaqTranslation = async (req, res, next) => {
	try {
		const { id } = req.params;
		const { language, question, answer } = req.body;

		if (!language || !question || !answer) {
			throw new AppError("Missing required translation fields", 400);
		}

		// Check if FAQ exists
		const existingFaq = await faqModel.findById(id);
		if (!existingFaq) {
			throw new AppError("FAQ not found", 404);
		}

		// Update translation
		await faqModel.updateTranslation(id, {
			language,
			question,
			answer,
		});

		// Get updated FAQ with the updated translation
		const updatedFaq = await faqModel.findById(id, language);

		// Get all translations
		const translations = await faqModel.getTranslations(id);

		// Add translations to response
		updatedFaq.translations = translations;

		res.json(formatReactAdminSave(updatedFaq));
	} catch (error) {
		next(error);
	}
};

/**
 * Delete FAQ
 * Compatible with React Admin delete
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const deleteFaq = async (req, res, next) => {
	try {
		const { id } = req.params;

		// Check if FAQ exists
		const existingFaq = await faqModel.findById(id);
		if (!existingFaq) {
			throw new AppError("FAQ not found", 404);
		}

		// Delete FAQ (this should cascade delete translations)
		const deleted = await faqModel.remove(id);

		if (!deleted) {
			throw new AppError("Failed to delete FAQ", 500);
		}

		res.json(formatReactAdminSave({ id }));
	} catch (error) {
		next(error);
	}
};

/**
 * Bulk delete FAQs
 * Compatible with React Admin deleteMany
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const bulkDeleteFaqs = async (req, res, next) => {
	try {
		const { ids } = req.body;

		// Use the bulk operation utility
		const result = await processBulkDelete(faqModel.remove, ids);

		res.json({ data: ids });
	} catch (error) {
		next(error);
	}
};

/**
 * Bulk update FAQs
 * Compatible with React Admin updateMany
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const bulkUpdateFaqs = async (req, res, next) => {
	try {
		const { ids, data } = req.body;

		// Use the bulk operation utility
		const result = await processBulkUpdate(faqModel.update, ids, data);

		res.json({ data: ids });
	} catch (error) {
		next(error);
	}
};

export default {
	getAllFaqs,
	getFaqById,
	createFaq,
	updateFaq,
	updateFaqTranslation,
	deleteFaq,
	bulkDeleteFaqs,
	bulkUpdateFaqs,
};
