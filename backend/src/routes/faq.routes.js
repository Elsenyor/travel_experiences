import express from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { handleContentRange } from "../middlewares/content-range.middleware.js";
import { handleBulkOperations } from "../middlewares/bulk-operations.middleware.js";
import faqController from "../controllers/faq.controller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: FAQs
 *   description: FAQ management endpoints
 */

/**
 * @swagger
 * /api/v1/faqs:
 *   get:
 *     summary: Get all FAQs
 *     tags: [FAQs]
 *     parameters:
 *       - in: query
 *         name: _start
 *         schema:
 *           type: integer
 *         description: Start index for pagination
 *       - in: query
 *         name: _end
 *         schema:
 *           type: integer
 *         description: End index for pagination
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *           default: es
 *         description: Language code for translations
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search in question or answer
 *     responses:
 *       200:
 *         description: List of FAQs
 *         headers:
 *           Content-Range:
 *             schema:
 *               type: string
 *             description: Pagination information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/FAQ'
 */
router.get("/", handleContentRange, faqController.getAllFaqs);

/**
 * @swagger
 * /api/v1/faqs/{id}:
 *   get:
 *     summary: Get FAQ by ID
 *     tags: [FAQs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: FAQ ID
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *           default: es
 *         description: Language code for translations
 *     responses:
 *       200:
 *         description: FAQ details with all translations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/FAQWithTranslations'
 *       404:
 *         description: FAQ not found
 */
router.get("/:id", faqController.getFaqById);

/**
 * @swagger
 * /api/v1/faqs:
 *   post:
 *     summary: Create new FAQ
 *     tags: [FAQs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - translations
 *             properties:
 *               translations:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - language
 *                     - question
 *                     - answer
 *                   properties:
 *                     language:
 *                       type: string
 *                     question:
 *                       type: string
 *                     answer:
 *                       type: string
 *     responses:
 *       201:
 *         description: FAQ created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/FAQWithTranslations'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 */
router.post("/", authenticate, faqController.createFaq);

/**
 * @swagger
 * /api/v1/faqs/{id}/translations:
 *   put:
 *     summary: Update FAQ translation
 *     tags: [FAQs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: FAQ ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - language
 *               - question
 *               - answer
 *             properties:
 *               language:
 *                 type: string
 *               question:
 *                 type: string
 *               answer:
 *                 type: string
 *     responses:
 *       200:
 *         description: Translation updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/FAQWithTranslations'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: FAQ not found
 */
router.put("/:id/translations", authenticate, faqController.updateFaqTranslation);

/**
 * @swagger
 * /api/v1/faqs/{id}:
 *   delete:
 *     summary: Delete FAQ
 *     tags: [FAQs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: FAQ ID
 *     responses:
 *       200:
 *         description: FAQ deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: FAQ not found
 */
router.delete("/:id", authenticate, faqController.deleteFaq);

// Handle bulk operations for React Admin
router.use(handleBulkOperations);

export default router;
