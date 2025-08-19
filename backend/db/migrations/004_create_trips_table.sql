-- Migration: Create trips table
-- Description: Creates the main trips table
-- Date: 2024-01-20
-- Author: System
-- Dependencies: 001_create_users_table.sql

-- Up Migration
CREATE TABLE IF NOT EXISTS trips (
    id INT AUTO_INCREMENT PRIMARY KEY,
    destination VARCHAR(100) NOT NULL COMMENT 'Destination city/location',
    trip_type VARCHAR(50) NOT NULL COMMENT 'Type of trip (cultural, adventure, etc)',
    price DECIMAL(10,2) NOT NULL COMMENT 'Trip price per person',
    featured BOOLEAN DEFAULT FALSE COMMENT 'Whether to show in featured section',
    created_by INT COMMENT 'Reference to user who created the trip',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Down Migration
-- DROP TABLE IF EXISTS trips;
