/**
 * SEO Routes
 * Routes for SEO-related endpoints (sitemap, robots.txt)
 */

import express from "express";
import seoController from "../controllers/seo.controller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: SEO
 *   description: SEO-related endpoints for search engines
 */

/**
 * @swagger
 * /sitemap.xml:
 *   get:
 *     summary: Get main sitemap
 *     tags: [SEO]
 *     description: Returns XML sitemap with all public URLs for search engines
 *     produces:
 *       - application/xml
 *     responses:
 *       200:
 *         description: Sitemap XML
 *         content:
 *           application/xml:
 *             schema:
 *               type: string
 */
router.get("/sitemap.xml", seoController.getSitemap);

/**
 * @swagger
 * /sitemap-index.xml:
 *   get:
 *     summary: Get sitemap index
 *     tags: [SEO]
 *     description: Returns sitemap index (for large sites with multiple sitemaps)
 *     produces:
 *       - application/xml
 *     responses:
 *       200:
 *         description: Sitemap index XML
 */
router.get("/sitemap-index.xml", seoController.getSitemapIndex);

/**
 * @swagger
 * /sitemap-trips.xml:
 *   get:
 *     summary: Get trips sitemap
 *     tags: [SEO]
 *     description: Returns sitemap with all trips URLs
 *     produces:
 *       - application/xml
 *     responses:
 *       200:
 *         description: Trips sitemap XML
 */
router.get("/sitemap-trips.xml", seoController.getTripsSitemap);

/**
 * @swagger
 * /sitemap-articles.xml:
 *   get:
 *     summary: Get articles sitemap
 *     tags: [SEO]
 *     description: Returns sitemap with all blog articles URLs
 *     produces:
 *       - application/xml
 *     responses:
 *       200:
 *         description: Articles sitemap XML
 */
router.get("/sitemap-articles.xml", seoController.getArticlesSitemap);

/**
 * @swagger
 * /robots.txt:
 *   get:
 *     summary: Get robots.txt
 *     tags: [SEO]
 *     description: Returns robots.txt file with crawling rules for search engines
 *     produces:
 *       - text/plain
 *     responses:
 *       200:
 *         description: robots.txt content
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 */
router.get("/robots.txt", seoController.getRobotsTxt);

export default router;
