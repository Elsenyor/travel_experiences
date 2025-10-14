-- Migration: Add slug fields to trips and articles tables
-- Purpose: Create SEO-friendly, permanent URLs that don't change when titles are updated
-- 
-- What this migration does:
-- 1. Adds 'slug' column to trips table
-- 2. Adds 'slug' column to articles table
-- 3. Creates indexes for fast slug lookups
-- 4. Adds unique constraints to prevent duplicate slugs
--
-- Note: Slugs will be generated automatically by the application
-- from the title when creating/updating records

-- Add slug to trips table
ALTER TABLE trips 
ADD COLUMN slug VARCHAR(255) DEFAULT NULL AFTER price,
ADD UNIQUE KEY unique_trip_slug (slug);

-- Add index for fast slug lookups
CREATE INDEX idx_trips_slug ON trips(slug);

-- Add slug to articles table
ALTER TABLE articles 
ADD COLUMN slug VARCHAR(255) DEFAULT NULL AFTER author_id,
ADD UNIQUE KEY unique_article_slug (slug);

-- Add index for fast slug lookups
CREATE INDEX idx_articles_slug ON articles(slug);

-- Add comments to document the columns
ALTER TABLE trips MODIFY COLUMN slug VARCHAR(255) DEFAULT NULL 
COMMENT 'SEO-friendly URL slug, auto-generated from title if not provided';

ALTER TABLE articles MODIFY COLUMN slug VARCHAR(255) DEFAULT NULL 
COMMENT 'SEO-friendly URL slug, auto-generated from title if not provided';

