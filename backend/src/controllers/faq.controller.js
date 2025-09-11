import faqModel from "../models/faq.model.js";
import { formatResponse, formatErrorResponse } from "../utils/response.formatter.js";

/**
 * Get all FAQs with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getAllFaqs = async (req, res) => {
	try {
		const { _start = 0, _end = 10, language = "es", q: search } = req.query;

		const limit = parseInt(_end) - parseInt(_start);
		const offset = parseInt(_start);

		// Get FAQs with filters
		const faqs = await faqModel.findAll({
			language,
			search,
			limit,
			offset,
		});

		// Get total count for Content-Range header
		const total = await faqModel.countAll({
			language,
			search,
		});

		// Set Content-Range header for React Admin
		res.set("Content-Range", `faqs ${_start}-${Math.min(total, _end - 1)}/${total}`);
		res.set("X-Total-Count", total.toString());

		return formatResponse(res, faqs);
	} catch (error) {
		return formatErrorResponse(res, error.message, 500);
	}
};

/**
 * Get FAQ by ID with translations
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getFaqById = async (req, res) => {
	try {
		const { id } = req.params;
		const { language = "es" } = req.query;

		const faq = await faqModel.findById(id, language);

		if (!faq) {
			return formatErrorResponse(res, "FAQ not found", 404);
		}

		// Get all translations
		const translations = await faqModel.getTranslations(id);

		// Add translations to response
		faq.translations = translations;

		return formatResponse(res, faq);
	} catch (error) {
		return formatErrorResponse(res, error.message, 500);
	}
};

/**
 * Create new FAQ with translations
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const createFaq = async (req, res) => {
	try {
		const { translations } = req.body;

		// Validate required fields
		if (!translations || !translations.length) {
			return formatErrorResponse(res, "At least one translation is required", 400);
		}

		// Create FAQ with translations
		const faqId = await faqModel.create({
			translations,
		});

		// Get created FAQ with translations
		const faq = await faqModel.findById(faqId, translations[0].language);

		// Get all translations
		const allTranslations = await faqModel.getTranslations(faqId);

		// Add translations to response
		faq.translations = allTranslations;

		return formatResponse(res, faq, 201);
	} catch (error) {
		return formatErrorResponse(res, error.message, 500);
	}
};

/**
 * Update FAQ translation
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const updateFaqTranslation = async (req, res) => {
	try {
		const { id } = req.params;
		const { language, question, answer } = req.body;

		if (!language || !question || !answer) {
			return formatErrorResponse(res, "Missing required translation fields", 400);
		}

		// Check if FAQ exists
		const existingFaq = await faqModel.findById(id);
		if (!existingFaq) {
			return formatErrorResponse(res, "FAQ not found", 404);
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

		return formatResponse(res, updatedFaq);
	} catch (error) {
		return formatErrorResponse(res, error.message, 500);
	}
};

/**
 * Delete FAQ
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const deleteFaq = async (req, res) => {
	try {
		const { id } = req.params;

		// Check if FAQ exists
		const existingFaq = await faqModel.findById(id);
		if (!existingFaq) {
			return formatErrorResponse(res, "FAQ not found", 404);
		}

		// Delete FAQ (this should cascade delete translations)
		await faqModel.remove(id);

		return formatResponse(res, { message: "FAQ deleted successfully" });
	} catch (error) {
		return formatErrorResponse(res, error.message, 500);
	}
};

export default {
	getAllFaqs,
	getFaqById,
	createFaq,
	updateFaqTranslation,
	deleteFaq,
};
