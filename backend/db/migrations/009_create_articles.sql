-- Migration: Create articles table
-- Description: Creates main articles table for the blog
-- Date: 2024-01-20
-- Updated: 2025-01-10 - Using UUIDs
-- Author: System
-- Dependencies: 001_create_users_table.sql
-- MySQL Version: 8.0.36

-- Up Migration
CREATE TABLE IF NOT EXISTS articles (
    id CHAR(36) NOT NULL PRIMARY KEY COMMENT 'Article UUID',
    author_id CHAR(36) NULL COMMENT 'Reference to article author',
    featured_image VARCHAR(255) COMMENT 'Main article image URL',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation timestamp',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_author_id (author_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Articles with UUID keys';

-- Down Migration
-- DROP TABLE IF EXISTS articles;
