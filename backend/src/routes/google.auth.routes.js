import { Router } from "express";
import GoogleAuthController from "../controllers/google.auth.controller.js";

const router = Router();

/**
 * @swagger
 * /api/v1/auth/google/url:
 *   get:
 *     tags: [Authentication]
 *     description: Get Google OAuth URL
 */
router.get("/url", GoogleAuthController.getAuthUrl);

/**
 * @swagger
 * /api/v1/auth/google/callback:
 *   get:
 *     tags: [Authentication]
 *     description: Handle Google OAuth callback
 */
router.get("/callback", GoogleAuthController.handleCallback);

export default router;
