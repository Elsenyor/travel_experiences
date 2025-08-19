-- Migration: Add Google Authentication fields
-- Description: Adds fields needed for Google OAuth integration
-- Date: 2024-01-20
-- Author: System
-- Dependencies: 001_create_users_table.sql

-- Up Migration
ALTER TABLE users
    ADD COLUMN auth_provider ENUM('local', 'google') DEFAULT 'local',
    ADD COLUMN google_id VARCHAR(255) UNIQUE,
    ADD COLUMN avatar_url VARCHAR(255),
    ADD INDEX idx_google_id (google_id),
    ADD INDEX idx_auth_provider (auth_provider);

-- Down Migration
-- ALTER TABLE users
--     DROP INDEX idx_auth_provider,
--     DROP INDEX idx_google_id,
--     DROP COLUMN avatar_url,
--     DROP COLUMN google_id,
--     DROP COLUMN auth_provider;
