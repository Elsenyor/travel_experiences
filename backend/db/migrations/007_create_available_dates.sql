-- Migration: Create available dates table
-- Description: Creates table for trip available dates
-- Date: 2024-01-20
-- Updated: 2025-01-10 - Using UUIDs
-- Author: System
-- Dependencies: 004_create_trips_table.sql
-- MySQL Version: 8.0.36

-- Up Migration
CREATE TABLE IF NOT EXISTS available_dates (
    id CHAR(36) NOT NULL PRIMARY KEY COMMENT 'Available date UUID',
    trip_id CHAR(36) NOT NULL COMMENT 'Reference to parent trip',
    start_date DATE NOT NULL COMMENT 'Trip start date',
    end_date DATE NOT NULL COMMENT 'Trip end date',
    available_spots INT NOT NULL COMMENT 'Number of spots available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation timestamp',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
    INDEX idx_trip_id (trip_id),
    INDEX idx_start_date (start_date),
    INDEX idx_available_spots (available_spots)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Trip available dates with UUID keys';

-- Down Migration
-- DROP TABLE IF EXISTS available_dates;
