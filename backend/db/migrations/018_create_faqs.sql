-- Migration: Create FAQs table
-- Description: Creates main table for frequently asked questions
-- Date: 2024-01-20
-- Updated: 2025-01-10 - Using UUIDs
-- Author: System
-- MySQL Version: 8.0.36

-- Up Migration
CREATE TABLE IF NOT EXISTS faqs (
    id CHAR(36) NOT NULL PRIMARY KEY COMMENT 'FAQ UUID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation timestamp',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='FAQs with UUID keys';

-- Down Migration
-- DROP TABLE IF EXISTS faqs;
