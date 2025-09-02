import { Router } from "express";
import BookingsController from "../controllers/bookings.controller.js";
import { authenticateToken, checkRole } from "../middlewares/auth.middleware.js";
import { handleReactAdminParams } from "../middlewares/react-admin.middleware.js";
import { handleBulkOperations } from "../middlewares/bulk-operations.middleware.js";

const router = Router();

// Apply React Admin middleware to all routes
router.use(handleReactAdminParams);

// Apply bulk operations middleware
router.use(handleBulkOperations);

/**
 * @swagger
 * /api/v1/bookings:
 *   get:
 *     tags: [Bookings]
 *     description: Get list of bookings with filtering and pagination
 *     security:
 *       - bearerAuth: []
 */
router.get("/", authenticateToken, BookingsController.searchBookings);

/**
 * @swagger
 * /api/v1/bookings/{id}:
 *   get:
 *     tags: [Bookings]
 *     description: Get booking by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     security:
 *       - bearerAuth: []
 */
router.get("/:id", authenticateToken, BookingsController.getBookingById);

/**
 * @swagger
 * /api/v1/bookings:
 *   post:
 *     tags: [Bookings]
 *     description: Create new booking
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [user_id, trip_id, trip_date, num_people]
 *     security:
 *       - bearerAuth: []
 */
router.post("/", authenticateToken, BookingsController.createBooking);

/**
 * @swagger
 * /api/v1/bookings/{id}:
 *   put:
 *     tags: [Bookings]
 *     description: Update booking
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
router.put("/:id", authenticateToken, BookingsController.updateBooking);

/**
 * @swagger
 * /api/v1/bookings/{id}:
 *   delete:
 *     tags: [Bookings]
 *     description: Delete booking
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     security:
 *       - bearerAuth: []
 */
router.delete("/:id", authenticateToken, BookingsController.deleteBooking);

/**
 * @swagger
 * /api/v1/bookings/bulk/delete:
 *   post:
 *     tags: [Bookings]
 *     description: Bulk delete bookings
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
router.post("/bulk/delete", authenticateToken, checkRole("admin"), BookingsController.bulkDeleteBookings);

/**
 * @swagger
 * /api/v1/bookings/bulk/update:
 *   post:
 *     tags: [Bookings]
 *     description: Bulk update bookings
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
router.post("/bulk/update", authenticateToken, checkRole("admin"), BookingsController.bulkUpdateBookings);

/**
 * @swagger
 * /api/v1/bookings/user/{userId}:
 *   get:
 *     tags: [Bookings]
 *     description: Get bookings for a specific user
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     security:
 *       - bearerAuth: []
 */
router.get("/user/:userId", authenticateToken, BookingsController.getUserBookings);

/**
 * @swagger
 * /api/v1/bookings/trip/{tripId}:
 *   get:
 *     tags: [Bookings]
 *     description: Get bookings for a specific trip
 *     parameters:
 *       - in: path
 *         name: tripId
 *         required: true
 *         schema:
 *           type: integer
 *     security:
 *       - bearerAuth: []
 */
router.get("/trip/:tripId", authenticateToken, BookingsController.getTripBookings);

/**
 * @swagger
 * /api/v1/bookings/statistics:
 *   get:
 *     tags: [Bookings]
 *     description: Get booking statistics
 *     security:
 *       - bearerAuth: []
 */
router.get("/statistics", authenticateToken, checkRole("admin"), BookingsController.getBookingStatistics);

/**
 * @swagger
 * /api/v1/bookings/{id}/status:
 *   patch:
 *     tags: [Bookings]
 *     description: Change booking status
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
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, cancelled]
 *     security:
 *       - bearerAuth: []
 */
router.patch("/:id/status", authenticateToken, BookingsController.changeBookingStatus);

export default router;
