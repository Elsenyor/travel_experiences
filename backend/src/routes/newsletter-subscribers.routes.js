import { Router } from "express";
import SubscribersController from "../controllers/newsletter-subscribers.controller.js";
import { authenticateToken, checkRole } from "../middlewares/auth.middleware.js";
import { handleReactAdminParams } from "../middlewares/react-admin.middleware.js";
import { handleBulkOperations } from "../middlewares/bulk-operations.middleware.js";

const router = Router();

// Apply middlewares to admin routes
router.use("/admin", authenticateToken, checkRole("admin"), handleReactAdminParams, handleBulkOperations);

/**
 * @swagger
 * /api/v1/newsletter/subscribers/admin:
 *   get:
 *     tags: [Newsletter]
 *     description: Get list of newsletter subscribers with filtering and pagination
 *     security:
 *       - bearerAuth: []
 */
router.get("/admin", SubscribersController.searchSubscribers);

/**
 * @swagger
 * /api/v1/newsletter/subscribers/admin/{id}:
 *   get:
 *     tags: [Newsletter]
 *     description: Get subscriber by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     security:
 *       - bearerAuth: []
 */
router.get("/admin/:id", SubscribersController.getSubscriberById);

/**
 * @swagger
 * /api/v1/newsletter/subscribers/admin:
 *   post:
 *     tags: [Newsletter]
 *     description: Create new subscriber
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *     security:
 *       - bearerAuth: []
 */
router.post("/admin", SubscribersController.createSubscriber);

/**
 * @swagger
 * /api/v1/newsletter/subscribers/admin/{id}:
 *   put:
 *     tags: [Newsletter]
 *     description: Update subscriber
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
router.put("/admin/:id", SubscribersController.updateSubscriber);

/**
 * @swagger
 * /api/v1/newsletter/subscribers/admin/{id}:
 *   delete:
 *     tags: [Newsletter]
 *     description: Delete subscriber
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     security:
 *       - bearerAuth: []
 */
router.delete("/admin/:id", SubscribersController.deleteSubscriber);

/**
 * @swagger
 * /api/v1/newsletter/subscribers/admin/bulk/delete:
 *   post:
 *     tags: [Newsletter]
 *     description: Bulk delete subscribers
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
router.post("/admin/bulk/delete", SubscribersController.bulkDeleteSubscribers);

/**
 * @swagger
 * /api/v1/newsletter/subscribers/admin/bulk/update:
 *   post:
 *     tags: [Newsletter]
 *     description: Bulk update subscribers
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
router.post("/admin/bulk/update", SubscribersController.bulkUpdateSubscribers);

/**
 * @swagger
 * /api/v1/newsletter/subscribers/subscribe:
 *   post:
 *     tags: [Newsletter]
 *     description: Public endpoint to subscribe to newsletter
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               preferred_language:
 *                 type: string
 *                 enum: [es, en]
 */
router.post("/subscribe", SubscribersController.subscribe);

/**
 * @swagger
 * /api/v1/newsletter/subscribers/unsubscribe:
 *   post:
 *     tags: [Newsletter]
 *     description: Public endpoint to unsubscribe from newsletter
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 */
router.post("/unsubscribe", SubscribersController.unsubscribe);

export default router;

