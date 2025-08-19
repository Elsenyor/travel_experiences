-- Migration: Initial schema
-- Description: Creates initial database and users table

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS asia_experiences
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE asia_experiences;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT 'User first name',
    surname VARCHAR(100) NOT NULL COMMENT 'User last name',
    email VARCHAR(100) NOT NULL UNIQUE COMMENT 'User email address',
    password VARCHAR(255) NULL COMMENT 'Password hash (NULL for OAuth users)',
    role ENUM('user', 'admin') DEFAULT 'user' COMMENT 'User role for authorization',
    auth_provider ENUM('local', 'google') DEFAULT 'local' COMMENT 'Authentication method used',
    google_id VARCHAR(255) UNIQUE COMMENT 'Google user ID for OAuth',
    avatar_url VARCHAR(255) COMMENT 'User profile picture URL',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Record last update timestamp',
    UNIQUE INDEX idx_email (email),
    INDEX idx_google_id (google_id),
    INDEX idx_auth_provider (auth_provider)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
