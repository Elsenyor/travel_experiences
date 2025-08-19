-- Migration: Create bookings table
-- Description: Creates table for trip bookings
-- Date: 2024-01-20
-- Author: System
-- Dependencies: 001_create_users_table.sql, 004_create_trips_table.sql

-- Up Migration
CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL COMMENT 'Reference to booking user',
    trip_id INT NOT NULL COMMENT 'Reference to booked trip',
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'When the booking was made',
    trip_date DATE NOT NULL COMMENT 'Selected trip date',
    num_people INT NOT NULL COMMENT 'Number of people in booking',
    status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending' COMMENT 'Booking status',
    comments TEXT COMMENT 'Additional booking comments',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Down Migration
-- DROP TABLE IF EXISTS bookings;
