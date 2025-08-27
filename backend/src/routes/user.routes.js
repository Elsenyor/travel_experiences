import { Router } from "express";
import UserController from "../controllers/user.controller.js";
import { authenticateToken, checkRole } from "../middlewares/auth.middleware.js";
import { handleReactAdminParams } from "../middlewares/react-admin.middleware.js";

const router = Router();

// Apply React Admin middleware to all routes
router.use(handleReactAdminParams);

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     tags: [Users]
 *     description: Get list of users with filtering and pagination
 *     security:
 *       - bearerAuth: []
 */
router.get("/", authenticateToken, checkRole("admin"), UserController.searchUsers);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   get:
 *     tags: [Users]
 *     description: Get user by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     security:
 *       - bearerAuth: []
 */
router.get("/:id", authenticateToken, UserController.getUserById);

/**
 * @swagger
 * /api/v1/users:
 *   post:
 *     tags: [Users]
 *     description: Create new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *     security:
 *       - bearerAuth: []
 */
router.post("/", authenticateToken, checkRole("admin"), UserController.createUser);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   put:
 *     tags: [Users]
 *     description: Update user
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
router.put("/:id", authenticateToken, checkRole("admin"), UserController.updateUser);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   delete:
 *     tags: [Users]
 *     description: Delete user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     security:
 *       - bearerAuth: []
 */
router.delete("/:id", authenticateToken, checkRole("admin"), UserController.deleteUser);

/**
 * @swagger
 * /api/v1/users/bulk:
 *   post:
 *     tags: [Users]
 *     description: Bulk operations on users
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
// Bulk delete
router.post("/bulk/delete", authenticateToken, checkRole("admin"), UserController.bulkDeleteUsers);

// Bulk update
router.post("/bulk/update", authenticateToken, checkRole("admin"), UserController.bulkUpdateUsers);

export default router;
