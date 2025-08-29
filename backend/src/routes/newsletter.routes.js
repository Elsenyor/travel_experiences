import { Router } from "express";
import subscribersRoutes from "./newsletter-subscribers.routes.js";
import campaignsRoutes from "./newsletter-campaigns.routes.js";
import sendsRoutes from "./newsletter-sends.routes.js";
import NewsletterService from "../services/newsletter.service.js";
import { authenticateToken, checkRole } from "../middlewares/auth.middleware.js";

const router = Router();

// Mount subscriber routes
router.use("/subscribers", subscribersRoutes);

// Mount campaign routes
router.use("/campaigns", campaignsRoutes);

// Mount send routes
router.use("/sends", sendsRoutes);

/**
 * @swagger
 * /api/v1/newsletter/stats:
 *   get:
 *     tags: [Newsletter]
 *     description: Get overall newsletter statistics
 *     security:
 *       - bearerAuth: []
 */
router.get("/stats", authenticateToken, checkRole("admin"), async (req, res, next) => {
	try {
		const stats = await NewsletterService.getNewsletterStats();
		res.json({
			status: "success",
			data: stats,
		});
	} catch (error) {
		next(error);
	}
});

export default router;
