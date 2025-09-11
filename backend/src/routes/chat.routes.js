import express from "express";
import { authenticate, optionalAuth } from "../middlewares/auth.middleware.js";
import { handleContentRange } from "../middlewares/content-range.middleware.js";
import { handleBulkOperations } from "../middlewares/bulk-operations.middleware.js";
import chatController from "../controllers/chat.controller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Chat
 *   description: Chat management endpoints
 */

/**
 * @swagger
 * /api/v1/chat/conversations:
 *   get:
 *     summary: Get all conversations (admin)
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [open, closed]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: List of conversations
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
 *                     $ref: '#/components/schemas/Conversation'
 *       401:
 *         description: Unauthorized
 */
router.get("/conversations", authenticate, handleContentRange, chatController.getAllConversations);

/**
 * @swagger
 * /api/v1/chat/users/{userId}/conversations:
 *   get:
 *     summary: Get user conversations
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
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
 *     responses:
 *       200:
 *         description: List of user conversations
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
 *                     $ref: '#/components/schemas/Conversation'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.get("/users/:userId/conversations", authenticate, chatController.getUserConversations);

/**
 * @swagger
 * /api/v1/chat/conversations/{id}:
 *   get:
 *     summary: Get conversation by ID with messages
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Conversation ID
 *       - in: query
 *         name: _start
 *         schema:
 *           type: integer
 *         description: Start index for messages pagination
 *       - in: query
 *         name: _end
 *         schema:
 *           type: integer
 *         description: End index for messages pagination
 *     responses:
 *       200:
 *         description: Conversation with messages
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/ConversationWithMessages'
 *       404:
 *         description: Conversation not found
 */
router.get("/conversations/:id", chatController.getConversationById);

/**
 * @swagger
 * /api/v1/chat/conversations:
 *   post:
 *     summary: Create new conversation
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Conversation created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Conversation'
 */
router.post("/conversations", optionalAuth, chatController.createConversation);

/**
 * @swagger
 * /api/v1/chat/conversations/{id}/status:
 *   put:
 *     summary: Update conversation status
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Conversation ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [open, closed]
 *     responses:
 *       200:
 *         description: Conversation status updated successfully
 *       400:
 *         description: Invalid status
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Conversation not found
 */
router.put("/conversations/:id/status", authenticate, chatController.updateConversationStatus);

/**
 * @swagger
 * /api/v1/chat/conversations/{id}:
 *   delete:
 *     summary: Delete conversation
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Conversation ID
 *     responses:
 *       200:
 *         description: Conversation deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Conversation not found
 */
router.delete("/conversations/:id", authenticate, chatController.deleteConversation);

/**
 * @swagger
 * /api/v1/chat/conversations/{id}/messages:
 *   get:
 *     summary: Get conversation messages
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Conversation ID
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
 *     responses:
 *       200:
 *         description: List of messages
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
 *                     $ref: '#/components/schemas/Message'
 *       404:
 *         description: Conversation not found
 */
router.get("/conversations/:id/messages", chatController.getConversationMessages);

/**
 * @swagger
 * /api/v1/chat/conversations/{id}/messages:
 *   post:
 *     summary: Add message to conversation
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Conversation ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *               sender:
 *                 type: string
 *                 enum: [user, bot, admin]
 *                 default: user
 *     responses:
 *       201:
 *         description: Message added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Message'
 *       400:
 *         description: Invalid input data or closed conversation
 *       404:
 *         description: Conversation not found
 */
router.post("/conversations/:id/messages", chatController.addMessage);

/**
 * @swagger
 * /api/v1/chat/conversations/{id}/messages/{messageId}:
 *   delete:
 *     summary: Delete message
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Conversation ID
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *         description: Message ID
 *     responses:
 *       200:
 *         description: Message deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Conversation or message not found
 */
router.delete("/conversations/:id/messages/:messageId", authenticate, chatController.deleteMessage);

// Handle bulk operations for React Admin
router.use(handleBulkOperations);

export default router;
