import { Router } from "express";
import AuthController from "../controllers/auth.controller.js";
import { authenticateToken, refreshAccessToken } from "../middlewares/auth.middleware.js";

const router = Router();

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     tags: [Authentication]
 *     description: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 */
router.post("/register", AuthController.register);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     tags: [Authentication]
 *     description: Login user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 */
router.post("/login", AuthController.login);

/**
 * @swagger
 * /api/v1/auth/profile:
 *   get:
 *     tags: [Authentication]
 *     description: Get current user profile
 *     security:
 *       - bearerAuth: []
 */
router.get("/profile", authenticateToken, AuthController.getProfile);

/**
 * @swagger
 * /api/v1/auth/refresh:
 *   post:
 *     tags: [Authentication]
 *     description: Refresh access token using refresh token cookie
 */
router.post("/refresh", refreshAccessToken);

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     tags: [Authentication]
 *     description: Logout user and clear refresh token cookie
 */
router.post("/logout", AuthController.logout);

export default router;
