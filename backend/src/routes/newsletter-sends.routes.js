import { Router } from "express";
import SendsController from "../controllers/newsletter-sends.controller.js";
import { authenticateToken, checkRole } from "../middlewares/auth.middleware.js";
import { handleReactAdminParams } from "../middlewares/react-admin.middleware.js";
import { handleBulkOperations } from "../middlewares/bulk-operations.middleware.js";

const router = Router();

// All send routes require authentication and admin role
router.use(authenticateToken, checkRole("admin"));

// Apply React Admin middlewares
router.use(handleReactAdminParams, handleBulkOperations);

/**
 * @swagger
 * /api/v1/newsletter/sends:
 *   get:
 *     tags: [Newsletter]
 *     description: Get list of newsletter sends with filtering and pagination
 *     security:
 *       - bearerAuth: []
 */
router.get("/", SendsController.searchSends);

/**
 * @swagger
 * /api/v1/newsletter/sends/{id}:
 *   get:
 *     tags: [Newsletter]
 *     description: Get send by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     security:
 *       - bearerAuth: []
 */
router.get("/:id", SendsController.getSendById);

/**
 * @swagger
 * /api/v1/newsletter/sends/{id}:
 *   put:
 *     tags: [Newsletter]
 *     description: Update send status
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
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, sent, failed]
 *               sent_date:
 *                 type: string
 *                 format: date-time
 *     security:
 *       - bearerAuth: []
 */
router.put("/:id", SendsController.updateSend);

/**
 * @swagger
 * /api/v1/newsletter/sends/{id}:
 *   delete:
 *     tags: [Newsletter]
 *     description: Delete send record
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     security:
 *       - bearerAuth: []
 */
router.delete("/:id", SendsController.deleteSend);

/**
 * @swagger
 * /api/v1/newsletter/sends/{id}/mark-sent:
 *   post:
 *     tags: [Newsletter]
 *     description: Mark send as sent
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     security:
 *       - bearerAuth: []
 */
router.post("/:id/mark-sent", SendsController.markAsSent);

/**
 * @swagger
 * /api/v1/newsletter/sends/{id}/mark-failed:
 *   post:
 *     tags: [Newsletter]
 *     description: Mark send as failed
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     security:
 *       - bearerAuth: []
 */
router.post("/:id/mark-failed", SendsController.markAsFailed);

/**
 * @swagger
 * /api/v1/newsletter/sends/{id}/retry:
 *   post:
 *     tags: [Newsletter]
 *     description: Retry failed send
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     security:
 *       - bearerAuth: []
 */
router.post("/:id/retry", SendsController.retrySend);

/**
 * @swagger
 * /api/v1/newsletter/sends/campaign/{campaignId}/stats:
 *   get:
 *     tags: [Newsletter]
 *     description: Get send statistics for a campaign
 *     parameters:
 *       - in: path
 *         name: campaignId
 *         required: true
 *         schema:
 *           type: integer
 *     security:
 *       - bearerAuth: []
 */
router.get("/campaign/:campaignId/stats", SendsController.getCampaignStats);

/**
 * @swagger
 * /api/v1/newsletter/sends/subscriber/{subscriberId}/stats:
 *   get:
 *     tags: [Newsletter]
 *     description: Get send statistics for a subscriber
 *     parameters:
 *       - in: path
 *         name: subscriberId
 *         required: true
 *         schema:
 *           type: integer
 *     security:
 *       - bearerAuth: []
 */
router.get("/subscriber/:subscriberId/stats", SendsController.getSubscriberStats);

/**
 * @swagger
 * /api/v1/newsletter/sends/bulk/delete:
 *   post:
 *     tags: [Newsletter]
 *     description: Bulk delete sends
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
router.post("/bulk/delete", SendsController.bulkDeleteSends);

/**
 * @swagger
 * /api/v1/newsletter/sends/bulk/update:
 *   post:
 *     tags: [Newsletter]
 *     description: Bulk update sends
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
router.post("/bulk/update", SendsController.bulkUpdateSends);

export default router;
