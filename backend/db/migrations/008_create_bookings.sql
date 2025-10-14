-- Migration: Create bookings table
-- Description: Creates table for trip bookings
-- Date: 2024-01-20
-- Updated: 2025-01-10 - Using UUIDs
-- Author: System
-- Dependencies: 001_create_users_table.sql, 004_create_trips_table.sql
-- MySQL Version: 8.0.36

-- Up Migration
CREATE TABLE IF NOT EXISTS bookings (
    id CHAR(36) NOT NULL PRIMARY KEY COMMENT 'Booking UUID',
    user_id CHAR(36) NOT NULL COMMENT 'Reference to booking user',
    trip_id CHAR(36) NOT NULL COMMENT 'Reference to booked trip',
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'When the booking was made',
    trip_date DATE NOT NULL COMMENT 'Selected trip date',
    num_people INT NOT NULL COMMENT 'Number of people in booking',
    status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending' COMMENT 'Booking status',
    comments TEXT COMMENT 'Additional booking comments',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation timestamp',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_trip_id (trip_id),
    INDEX idx_status (status),
    INDEX idx_trip_date (trip_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Trip bookings with UUID keys';

-- Down Migration
-- DROP TABLE IF EXISTS bookings;
