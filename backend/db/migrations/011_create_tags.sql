-- Migration: Create tags table
-- Description: Creates table for article tags
-- Date: 2024-01-20
-- Updated: 2025-01-10 - Using UUIDs
-- Author: System
-- MySQL Version: 8.0.36

-- Up Migration
CREATE TABLE IF NOT EXISTS tags (
    id CHAR(36) NOT NULL PRIMARY KEY COMMENT 'Tag UUID',
    name VARCHAR(50) NOT NULL COMMENT 'Tag name',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation timestamp',
    UNIQUE INDEX idx_tag_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Tags with UUID keys';

-- Down Migration
-- DROP TABLE IF EXISTS tags;
