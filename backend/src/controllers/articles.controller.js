import ArticlesModel from "../models/articles.model.js";
import ArticleTranslationsModel from "../models/article-translations.model.js";
import TagsModel from "../models/tags.model.js";
import { AppError } from "../middlewares/error.middleware.js";
import { setContentRange } from "../middlewares/content-range.middleware.js";
import { formatReactAdminList, formatReactAdminGetOne, formatReactAdminSave } from "../utils/response.formatter.js";
import { processBulkDelete, processBulkUpdate } from "../middlewares/bulk-operations.middleware.js";
import { includeResourceRelations } from "../utils/relation-manager.js";

/**
 * Get article by ID with translations in the specified language
 * Compatible with React Admin getOne
 */
export const getArticleById = async (req, res, next) => {
	try {
		const { id } = req.params;
		const language = req.query.language || "es";

		// Get article with translation in the specified language
		const article = await ArticlesModel.findById(id, language);

		if (!article) {
			throw new AppError("Article not found", 404);
		}

		// Get article tags
		const tags = await TagsModel.getArticleTags(id);

		// Include tags in the response
		const articleWithRelations = includeResourceRelations(article, { tags });

		// Format response for React Admin
		res.json(formatReactAdminGetOne(articleWithRelations));
	} catch (error) {
		next(error);
	}
};

/**
 * Create new article with translations
 * Compatible with React Admin create
 */
export const createArticle = async (req, res, next) => {
	try {
		const { author_id, featured_image, translations, tags } = req.body;

		// Validate required fields
		if (!author_id) {
			throw new AppError("Author ID is required", 400);
		}

		if (!translations || !Array.isArray(translations) || translations.length === 0) {
			throw new AppError("At least one translation is required", 400);
		}

		// Create article
		const articleId = await ArticlesModel.create({
			author_id,
			featured_image,
			translations,
			tags,
		});

		// Get the created article to return full object
		const article = await ArticlesModel.findById(articleId);
		const articleTags = await TagsModel.getArticleTags(articleId);

		// Include tags in the response
		const articleWithRelations = includeResourceRelations(article, { tags: articleTags });

		res.status(201).json(formatReactAdminSave(articleWithRelations));
	} catch (error) {
		next(error);
	}
};

/**
 * Update article
 * Compatible with React Admin update
 */
export const updateArticle = async (req, res, next) => {
	try {
		const { id } = req.params;
		const { author_id, featured_image, translations, tags } = req.body;

		// Check if article exists
		const existingArticle = await ArticlesModel.findById(id);
		if (!existingArticle) {
			throw new AppError("Article not found", 404);
		}

		// Update article basic data
		const articleData = {};
		if (author_id !== undefined) articleData.author_id = author_id;
		if (featured_image !== undefined) articleData.featured_image = featured_image;

		if (Object.keys(articleData).length > 0) {
			await ArticlesModel.update(id, articleData);
		}

		// Update translations if provided
		if (translations && Array.isArray(translations)) {
			for (const translation of translations) {
				const { language, title, content } = translation;

				// Find existing translation
				const existingTranslation = await ArticleTranslationsModel.findByArticleIdAndLanguage(id, language);

				if (existingTranslation) {
					// Update existing translation
					await ArticleTranslationsModel.update(existingTranslation.id, { title, content });
				} else {
					// Create new translation
					await ArticleTranslationsModel.create({
						article_id: id,
						language,
						title,
						content,
					});
				}
			}
		}

		// Update tags if provided
		if (tags !== undefined) {
			await TagsModel.setArticleTags(id, tags);
		}

		// Get updated article
		const updatedArticle = await ArticlesModel.findById(id);
		const articleTags = await TagsModel.getArticleTags(id);

		// Include tags in the response
		const articleWithRelations = includeResourceRelations(updatedArticle, { tags: articleTags });

		res.json(formatReactAdminSave(articleWithRelations));
	} catch (error) {
		next(error);
	}
};

/**
 * Delete article
 * Compatible with React Admin delete
 */
export const deleteArticle = async (req, res, next) => {
	try {
		const { id } = req.params;

		// Check if article exists
		const article = await ArticlesModel.findById(id);
		if (!article) {
			throw new AppError("Article not found", 404);
		}

		// Delete article (will cascade delete translations and tag relations)
		const deleted = await ArticlesModel.remove(id);
		if (!deleted) {
			throw new AppError("Failed to delete article", 500);
		}

		res.json(formatReactAdminSave({ id }));
	} catch (error) {
		next(error);
	}
};

/**
 * Search articles with filtering, sorting, and pagination
 * Compatible with React Admin getList
 */
export const searchArticles = async (req, res, next) => {
	try {
		// Use React Admin params if available, otherwise use standard query params
		const params = req.reactAdminParams || {};
		const filters = params.filters || {};
		const pagination = params.pagination || { offset: 0, limit: 10 };
		const sort = params.sort || { field: "created_at", order: "DESC" };
		const language = filters.language || req.query.language || "es";

		// Map React Admin filters to our model's expected format
		const articles = await ArticlesModel.findByFilters({
			language,
			search: params.search || filters.q,
			author_id: filters.author_id,
			tag_id: filters.tag_id,
			limit: pagination.limit,
			offset: pagination.offset,
			sortField: sort.field,
			sortOrder: sort.order,
		});

		// Get total count for pagination
		const count = await ArticlesModel.countByFilters({
			language,
			search: params.search || filters.q,
			author_id: filters.author_id,
			tag_id: filters.tag_id,
		});

		// Get tags for each article
		const articlesWithTags = await Promise.all(
			articles.map(async (article) => {
				const tags = await TagsModel.getArticleTags(article.id);
				return { ...article, tags };
			})
		);

		// Set Content-Range header for React Admin
		setContentRange(req, res, count);

		// Format response for React Admin
		res.json(formatReactAdminList(articlesWithTags, count));
	} catch (error) {
		next(error);
	}
};

/**
 * Bulk delete articles
 * Compatible with React Admin deleteMany
 */
export const bulkDeleteArticles = async (req, res, next) => {
	try {
		const { ids } = req.body;

		// Use the bulk operation utility
		const result = await processBulkDelete(ArticlesModel.remove, ids);

		res.json({ data: ids });
	} catch (error) {
		next(error);
	}
};

/**
 * Bulk update articles
 * Compatible with React Admin updateMany
 */
export const bulkUpdateArticles = async (req, res, next) => {
	try {
		const { ids, data } = req.body;

		// Use the bulk operation utility
		const result = await processBulkUpdate(ArticlesModel.update, ids, data);

		res.json({ data: ids });
	} catch (error) {
		next(error);
	}
};

export default {
	getArticleById,
	createArticle,
	updateArticle,
	deleteArticle,
	searchArticles,
	bulkDeleteArticles,
	bulkUpdateArticles,
};
