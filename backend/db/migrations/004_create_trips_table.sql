-- Migration: Create trips table
-- Description: Creates the main trips table with UUID
-- Date: 2024-01-20
-- Updated: 2025-01-10 - Using UUIDs from the start
-- Author: System
-- Dependencies: 001_create_users_table.sql
-- MySQL Version: 8.0.36

-- Up Migration
CREATE TABLE IF NOT EXISTS trips (
    id CHAR(36) NOT NULL PRIMARY KEY COMMENT 'Trip UUID',
    destination VARCHAR(100) NOT NULL COMMENT 'Destination city/location',
    trip_type VARCHAR(50) NOT NULL COMMENT 'Type of trip (cultural, adventure, etc)',
    price DECIMAL(10,2) NOT NULL COMMENT 'Trip price per person',
    featured BOOLEAN DEFAULT FALSE COMMENT 'Whether to show in featured section',
    created_by CHAR(36) NULL COMMENT 'Reference to user who created the trip',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation timestamp',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',
    INDEX idx_destination (destination),
    INDEX idx_trip_type (trip_type),
    INDEX idx_featured (featured),
    INDEX idx_created_by (created_by),
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Trips table with UUID primary keys';

-- Down Migration
-- DROP TABLE IF EXISTS trips;
