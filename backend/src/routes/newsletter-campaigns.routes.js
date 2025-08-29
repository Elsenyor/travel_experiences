import { Router } from "express";
import CampaignsController from "../controllers/newsletter-campaigns.controller.js";
import { authenticateToken, checkRole } from "../middlewares/auth.middleware.js";
import { handleReactAdminParams } from "../middlewares/react-admin.middleware.js";
import { handleBulkOperations } from "../middlewares/bulk-operations.middleware.js";

const router = Router();

// All campaign routes require authentication and admin role
router.use(authenticateToken, checkRole("admin"));

// Apply React Admin middlewares
router.use(handleReactAdminParams, handleBulkOperations);

/**
 * @swagger
 * /api/v1/newsletter/campaigns:
 *   get:
 *     tags: [Newsletter]
 *     description: Get list of newsletter campaigns with filtering and pagination
 *     security:
 *       - bearerAuth: []
 */
router.get("/", CampaignsController.searchCampaigns);

/**
 * @swagger
 * /api/v1/newsletter/campaigns/{id}:
 *   get:
 *     tags: [Newsletter]
 *     description: Get campaign by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     security:
 *       - bearerAuth: []
 */
router.get("/:id", CampaignsController.getCampaignById);

/**
 * @swagger
 * /api/v1/newsletter/campaigns/{id}/sends:
 *   get:
 *     tags: [Newsletter]
 *     description: Get campaign sends
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     security:
 *       - bearerAuth: []
 */
router.get("/:id/sends", CampaignsController.getCampaignSends);

/**
 * @swagger
 * /api/v1/newsletter/campaigns:
 *   post:
 *     tags: [Newsletter]
 *     description: Create new campaign
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [language, subject, content]
 *     security:
 *       - bearerAuth: []
 */
router.post("/", CampaignsController.createCampaign);

/**
 * @swagger
 * /api/v1/newsletter/campaigns/{id}:
 *   put:
 *     tags: [Newsletter]
 *     description: Update campaign
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
router.put("/:id", CampaignsController.updateCampaign);

/**
 * @swagger
 * /api/v1/newsletter/campaigns/{id}:
 *   delete:
 *     tags: [Newsletter]
 *     description: Delete campaign
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     security:
 *       - bearerAuth: []
 */
router.delete("/:id", CampaignsController.deleteCampaign);

/**
 * @swagger
 * /api/v1/newsletter/campaigns/{id}/send:
 *   post:
 *     tags: [Newsletter]
 *     description: Send campaign to all active subscribers with matching language preference
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     security:
 *       - bearerAuth: []
 */
router.post("/:id/send", CampaignsController.sendCampaign);

/**
 * @swagger
 * /api/v1/newsletter/campaigns/bulk/delete:
 *   post:
 *     tags: [Newsletter]
 *     description: Bulk delete campaigns
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
router.post("/bulk/delete", CampaignsController.bulkDeleteCampaigns);

/**
 * @swagger
 * /api/v1/newsletter/campaigns/bulk/update:
 *   post:
 *     tags: [Newsletter]
 *     description: Bulk update campaigns
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
router.post("/bulk/update", CampaignsController.bulkUpdateCampaigns);

export default router;

