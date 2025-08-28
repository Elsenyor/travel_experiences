import { Router } from "express";
import { authenticateToken, checkRole } from "../middlewares/auth.middleware.js";
import { handleReactAdminParams } from "../middlewares/react-admin.middleware.js";
import { handleBulkOperations } from "../middlewares/bulk-operations.middleware.js";
import TagsModel from "../models/tags.model.js";
import { AppError } from "../middlewares/error.middleware.js";
import { setContentRange } from "../middlewares/content-range.middleware.js";
import { formatReactAdminList, formatReactAdminGetOne, formatReactAdminSave } from "../utils/response.formatter.js";

const router = Router();

// Apply middlewares to all routes
router.use(handleReactAdminParams);
router.use(handleBulkOperations);

/**
 * @swagger
 * /api/v1/tags:
 *   get:
 *     tags: [Tags]
 *     description: Get list of tags with filtering and pagination
 */
router.get("/", async (req, res, next) => {
	try {
		// Use React Admin params if available, otherwise use standard query params
		const params = req.reactAdminParams || {};
		const filters = params.filters || {};
		const pagination = params.pagination || { offset: 0, limit: 100 };
		const sort = params.sort || { field: "name", order: "ASC" };

		// Get tags
		const tags = await TagsModel.getAll({
			search: params.search || filters.q,
			limit: pagination.limit,
			offset: pagination.offset,
		});

		// Get total count for pagination
		const count = await TagsModel.count({
			search: params.search || filters.q,
		});

		// Set Content-Range header for React Admin
		setContentRange(req, res, count);

		// Format response for React Admin
		res.json(formatReactAdminList(tags, count));
	} catch (error) {
		next(error);
	}
});

/**
 * @swagger
 * /api/v1/tags/{id}:
 *   get:
 *     tags: [Tags]
 *     description: Get tag by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.get("/:id", async (req, res, next) => {
	try {
		const tag = await TagsModel.findById(req.params.id);
		if (!tag) {
			throw new AppError("Tag not found", 404);
		}
		res.json(formatReactAdminGetOne(tag));
	} catch (error) {
		next(error);
	}
});

/**
 * @swagger
 * /api/v1/tags:
 *   post:
 *     tags: [Tags]
 *     description: Create new tag
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *     security:
 *       - bearerAuth: []
 */
router.post("/", authenticateToken, checkRole("admin"), async (req, res, next) => {
	try {
		const { name } = req.body;
		if (!name) {
			throw new AppError("Tag name is required", 400);
		}

		const tagId = await TagsModel.create(name);
		const tag = await TagsModel.findById(tagId);

		res.status(201).json(formatReactAdminSave(tag));
	} catch (error) {
		if (error.message.includes("already exists")) {
			next(new AppError(error.message, 400));
		} else {
			next(error);
		}
	}
});

/**
 * @swagger
 * /api/v1/tags/{id}:
 *   put:
 *     tags: [Tags]
 *     description: Update tag
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *     security:
 *       - bearerAuth: []
 */
router.put("/:id", authenticateToken, checkRole("admin"), async (req, res, next) => {
	try {
		const { id } = req.params;
		const { name } = req.body;

		if (!name) {
			throw new AppError("Tag name is required", 400);
		}

		const tag = await TagsModel.findById(id);
		if (!tag) {
			throw new AppError("Tag not found", 404);
		}

		await TagsModel.update(id, name);
		const updatedTag = await TagsModel.findById(id);

		res.json(formatReactAdminSave(updatedTag));
	} catch (error) {
		if (error.message.includes("already exists")) {
			next(new AppError(error.message, 400));
		} else {
			next(error);
		}
	}
});

/**
 * @swagger
 * /api/v1/tags/{id}:
 *   delete:
 *     tags: [Tags]
 *     description: Delete tag
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     security:
 *       - bearerAuth: []
 */
router.delete("/:id", authenticateToken, checkRole("admin"), async (req, res, next) => {
	try {
		const { id } = req.params;

		const tag = await TagsModel.findById(id);
		if (!tag) {
			throw new AppError("Tag not found", 404);
		}

		await TagsModel.remove(id);
		res.json(formatReactAdminSave({ id }));
	} catch (error) {
		next(error);
	}
});

export default router;
