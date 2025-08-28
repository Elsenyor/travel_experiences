import { Router } from "express";
import ArticlesController from "../controllers/articles.controller.js";
import { authenticateToken, checkRole } from "../middlewares/auth.middleware.js";
import { handleReactAdminParams } from "../middlewares/react-admin.middleware.js";
import { handleBulkOperations } from "../middlewares/bulk-operations.middleware.js";
import { parseRelationParams } from "../middlewares/relations.middleware.js";

const router = Router();

// Apply middlewares to all routes
router.use(handleReactAdminParams);
router.use(handleBulkOperations);
router.use(parseRelationParams);

/**
 * @swagger
 * /api/v1/articles:
 *   get:
 *     tags: [Articles]
 *     description: Get list of articles with filtering and pagination
 */
router.get("/", ArticlesController.searchArticles);

/**
 * @swagger
 * /api/v1/articles/{id}:
 *   get:
 *     tags: [Articles]
 *     description: Get article by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.get("/:id", ArticlesController.getArticleById);

/**
 * @swagger
 * /api/v1/articles:
 *   post:
 *     tags: [Articles]
 *     description: Create new article
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [author_id, translations]
 *     security:
 *       - bearerAuth: []
 */
router.post("/", authenticateToken, checkRole("admin"), ArticlesController.createArticle);

/**
 * @swagger
 * /api/v1/articles/{id}:
 *   put:
 *     tags: [Articles]
 *     description: Update article
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
 *     security:
 *       - bearerAuth: []
 */
router.put("/:id", authenticateToken, checkRole("admin"), ArticlesController.updateArticle);

/**
 * @swagger
 * /api/v1/articles/{id}:
 *   delete:
 *     tags: [Articles]
 *     description: Delete article
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     security:
 *       - bearerAuth: []
 */
router.delete("/:id", authenticateToken, checkRole("admin"), ArticlesController.deleteArticle);

/**
 * @swagger
 * /api/v1/articles/bulk/delete:
 *   post:
 *     tags: [Articles]
 *     description: Bulk delete articles
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *     security:
 *       - bearerAuth: []
 */
router.post("/bulk/delete", authenticateToken, checkRole("admin"), ArticlesController.bulkDeleteArticles);

/**
 * @swagger
 * /api/v1/articles/bulk/update:
 *   post:
 *     tags: [Articles]
 *     description: Bulk update articles
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *               data:
 *                 type: object
 *     security:
 *       - bearerAuth: []
 */
router.post("/bulk/update", authenticateToken, checkRole("admin"), ArticlesController.bulkUpdateArticles);

export default router;
