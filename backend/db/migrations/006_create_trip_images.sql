-- Migration: Create trip images table
-- Description: Creates table for trip gallery images
-- Date: 2024-01-20
-- Author: System
-- Dependencies: 004_create_trips_table.sql

-- Up Migration
CREATE TABLE IF NOT EXISTS trip_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    trip_id INT NOT NULL COMMENT 'Reference to parent trip',
    url VARCHAR(255) NOT NULL COMMENT 'Image URL',
    description VARCHAR(255) COMMENT 'Image description/alt text',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Down Migration
-- DROP TABLE IF EXISTS trip_images;
