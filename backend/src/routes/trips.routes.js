import express from "express";
import { authenticateToken, checkRole } from "../middlewares/auth.middleware.js";
import { handleReactAdminParams } from "../middlewares/react-admin.middleware.js";
import { handleBulkOperations } from "../middlewares/bulk-operations.middleware.js";
import { parseRelationParams } from "../middlewares/relations.middleware.js";
import tripsController from "../controllers/trips.controller.js";

const router = express.Router();

// Apply React Admin middleware to all routes
router.use(handleReactAdminParams);
router.use(handleBulkOperations);
router.use(parseRelationParams);

/**
 * @swagger
 * tags:
 *   name: Trips
 *   description: Trip management endpoints
 */

/**
 * @swagger
 * /api/v1/trips:
 *   get:
 *     summary: Get all trips
 *     tags: [Trips]
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
 *         name: _sort
 *         schema:
 *           type: string
 *         description: Field to sort by
 *       - in: query
 *         name: _order
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *         description: Sort order
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *           default: es
 *         description: Language code for translations
 *       - in: query
 *         name: destination
 *         schema:
 *           type: string
 *         description: Filter by destination
 *       - in: query
 *         name: trip_type
 *         schema:
 *           type: string
 *         description: Filter by trip type
 *       - in: query
 *         name: min_price
 *         schema:
 *           type: number
 *         description: Minimum price filter
 *       - in: query
 *         name: max_price
 *         schema:
 *           type: number
 *         description: Maximum price filter
 *       - in: query
 *         name: featured
 *         schema:
 *           type: boolean
 *         description: Filter by featured status
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search in title and description
 *     responses:
 *       200:
 *         description: List of trips
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
 *                     $ref: '#/components/schemas/Trip'
 */
router.get("/", tripsController.getAllTrips);

/**
 * @swagger
 * /api/v1/trips/{id}:
 *   get:
 *     summary: Get trip by ID
 *     tags: [Trips]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Trip ID
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *           default: es
 *         description: Language code for translations
 *     responses:
 *       200:
 *         description: Trip details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Trip'
 *       404:
 *         description: Trip not found
 */
router.get("/:id", tripsController.getTripById);

/**
 * @swagger
 * /api/v1/trips:
 *   post:
 *     summary: Create new trip
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - destination
 *               - trip_type
 *               - price
 *               - translations
 *             properties:
 *               destination:
 *                 type: string
 *               trip_type:
 *                 type: string
 *               price:
 *                 type: number
 *               featured:
 *                 type: boolean
 *                 default: false
 *               translations:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - language
 *                     - title
 *                     - description
 *                     - itinerary
 *                   properties:
 *                     language:
 *                       type: string
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *                     itinerary:
 *                       type: string
 *     responses:
 *       201:
 *         description: Trip created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 */
router.post("/", authenticateToken, checkRole("admin"), tripsController.createTrip);

/**
 * @swagger
 * /api/v1/trips/{id}:
 *   put:
 *     summary: Update trip
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Trip ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               destination:
 *                 type: string
 *               trip_type:
 *                 type: string
 *               price:
 *                 type: number
 *               featured:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Trip updated successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Trip not found
 */
router.put("/:id", authenticateToken, checkRole("admin"), tripsController.updateTrip);

/**
 * @swagger
 * /api/v1/trips/{id}/translations:
 *   put:
 *     summary: Update trip translation
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Trip ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - language
 *               - title
 *               - description
 *               - itinerary
 *             properties:
 *               language:
 *                 type: string
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               itinerary:
 *                 type: string
 *     responses:
 *       200:
 *         description: Translation updated successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Trip not found
 */
router.put("/:id/translations", authenticateToken, checkRole("admin"), tripsController.updateTripTranslation);

/**
 * @swagger
 * /api/v1/trips/{id}:
 *   delete:
 *     summary: Delete trip
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Trip ID
 *     responses:
 *       200:
 *         description: Trip deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Trip not found
 */
router.delete("/:id", authenticateToken, checkRole("admin"), tripsController.deleteTrip);

/**
 * @swagger
 * /api/v1/trips/{id}/images:
 *   get:
 *     summary: Get trip images
 *     tags: [Trips]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Trip ID
 *     responses:
 *       200:
 *         description: List of trip images
 *       404:
 *         description: Trip not found
 */
router.get("/:id/images", tripsController.getTripImages);

/**
 * @swagger
 * /api/v1/trips/{id}/images:
 *   post:
 *     summary: Add image to trip
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Trip ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - url
 *             properties:
 *               url:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Image added successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Trip not found
 */
router.post("/:id/images", authenticateToken, checkRole("admin"), tripsController.addTripImage);

/**
 * @swagger
 * /api/v1/trips/{id}/dates:
 *   get:
 *     summary: Get trip available dates
 *     tags: [Trips]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Trip ID
 *     responses:
 *       200:
 *         description: List of available dates
 *       404:
 *         description: Trip not found
 */
router.get("/:id/dates", tripsController.getTripDates);

/**
 * @swagger
 * /api/v1/trips/{id}/dates:
 *   post:
 *     summary: Add available date to trip
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Trip ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - start_date
 *               - end_date
 *               - spots_available
 *             properties:
 *               start_date:
 *                 type: string
 *                 format: date
 *               end_date:
 *                 type: string
 *                 format: date
 *               spots_available:
 *                 type: integer
 *               price_modifier:
 *                 type: number
 *                 default: 0
 *     responses:
 *       201:
 *         description: Available date added successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Trip not found
 */
router.post("/:id/dates", authenticateToken, checkRole("admin"), tripsController.addAvailableDate);

/**
 * @swagger
 * /api/v1/trips/bulk/delete:
 *   post:
 *     summary: Bulk delete trips
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
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
 *                   type: string
 *     responses:
 *       200:
 *         description: Trips deleted successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/bulk/delete", authenticateToken, checkRole("admin"), tripsController.bulkDeleteTrips);

/**
 * @swagger
 * /api/v1/trips/bulk/update:
 *   post:
 *     summary: Bulk update trips
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
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
 *                   type: string
 *               data:
 *                 type: object
 *     responses:
 *       200:
 *         description: Trips updated successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/bulk/update", authenticateToken, checkRole("admin"), tripsController.bulkUpdateTrips);

export default router;
