-- Migration: Create trip translations table
-- Description: Creates table for multilingual trip content
-- Date: 2024-01-20
-- Updated: 2025-01-10 - Using UUIDs
-- Author: System
-- Dependencies: 004_create_trips_table.sql
-- MySQL Version: 8.0.36

-- Up Migration
CREATE TABLE IF NOT EXISTS trip_translations (
    id CHAR(36) NOT NULL PRIMARY KEY COMMENT 'Translation UUID',
    trip_id CHAR(36) NOT NULL COMMENT 'Reference to parent trip',
    language VARCHAR(2) NOT NULL COMMENT 'Language code (es, en, etc)',
    title VARCHAR(200) NOT NULL COMMENT 'Translated trip title',
    description TEXT NOT NULL COMMENT 'Translated trip description',
    itinerary TEXT NOT NULL COMMENT 'Translated day-by-day itinerary',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation timestamp',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
    UNIQUE INDEX idx_trip_lang (trip_id, language),
    INDEX idx_language (language)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Trip translations with UUID keys';

-- Down Migration
-- DROP TABLE IF EXISTS trip_translations;
