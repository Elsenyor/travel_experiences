-- Migration: Create available dates table
-- Description: Creates table for trip available dates
-- Date: 2024-01-20
-- Author: System
-- Dependencies: 004_create_trips_table.sql

-- Up Migration
CREATE TABLE IF NOT EXISTS available_dates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    trip_id INT NOT NULL COMMENT 'Reference to parent trip',
    start_date DATE NOT NULL COMMENT 'Trip start date',
    end_date DATE NOT NULL COMMENT 'Trip end date',
    available_spots INT NOT NULL COMMENT 'Number of spots available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Down Migration
-- DROP TABLE IF EXISTS available_dates;
