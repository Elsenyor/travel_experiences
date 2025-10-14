-- Migration: Create trip images table
-- Description: Creates table for trip gallery images
-- Date: 2024-01-20
-- Updated: 2025-01-10 - Using UUIDs
-- Author: System
-- Dependencies: 004_create_trips_table.sql
-- MySQL Version: 8.0.36

-- Up Migration
CREATE TABLE IF NOT EXISTS trip_images (
    id CHAR(36) NOT NULL PRIMARY KEY COMMENT 'Image UUID',
    trip_id CHAR(36) NOT NULL COMMENT 'Reference to parent trip',
    url VARCHAR(255) NOT NULL COMMENT 'Image URL',
    description VARCHAR(255) COMMENT 'Image description/alt text',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Upload timestamp',
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
    INDEX idx_trip_id (trip_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Trip images with UUID keys';

-- Down Migration
-- DROP TABLE IF EXISTS trip_images;
