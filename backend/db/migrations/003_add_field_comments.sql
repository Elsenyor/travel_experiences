-- Migration: Add field comments
-- Description: Adds descriptive comments to all fields
-- Date: 2024-01-20
-- Author: System
-- Dependencies: 001_create_users_table.sql, 002_add_google_auth_fields.sql

-- Up Migration
ALTER TABLE users
    MODIFY COLUMN name VARCHAR(100) NOT NULL COMMENT 'User first name',
    MODIFY COLUMN surname VARCHAR(100) NOT NULL COMMENT 'User last name',
    MODIFY COLUMN email VARCHAR(100) NOT NULL COMMENT 'User email address',
    MODIFY COLUMN password VARCHAR(255) NULL COMMENT 'Password hash (NULL for OAuth users)',
    MODIFY COLUMN role ENUM('user', 'admin') DEFAULT 'user' COMMENT 'User role for authorization',
    MODIFY COLUMN auth_provider ENUM('local', 'google') DEFAULT 'local' COMMENT 'Authentication method used',
    MODIFY COLUMN google_id VARCHAR(255) UNIQUE COMMENT 'Google user ID for OAuth',
    MODIFY COLUMN avatar_url VARCHAR(255) COMMENT 'User profile picture URL',
    MODIFY COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
    MODIFY COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Record last update timestamp';

-- Down Migration
-- ALTER TABLE users
--     MODIFY COLUMN name VARCHAR(100) NOT NULL,
--     MODIFY COLUMN surname VARCHAR(100) NOT NULL,
--     MODIFY COLUMN email VARCHAR(100) NOT NULL,
--     MODIFY COLUMN password VARCHAR(255) NULL,
--     MODIFY COLUMN role ENUM('user', 'admin') DEFAULT 'user',
--     MODIFY COLUMN auth_provider ENUM('local', 'google') DEFAULT 'local',
--     MODIFY COLUMN google_id VARCHAR(255) UNIQUE,
--     MODIFY COLUMN avatar_url VARCHAR(255),
--     MODIFY COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     MODIFY COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
