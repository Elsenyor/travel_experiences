-- Migration: Create newsletter campaigns table
-- Description: Creates table for newsletter campaign management
-- Date: 2024-01-20
-- Updated: 2025-01-10 - Using UUIDs
-- Author: System
-- MySQL Version: 8.0.36

-- Up Migration
CREATE TABLE IF NOT EXISTS newsletter_campaigns (
    id CHAR(36) NOT NULL PRIMARY KEY COMMENT 'Campaign UUID',
    language VARCHAR(2) NOT NULL COMMENT 'Campaign language',
    subject VARCHAR(200) NOT NULL COMMENT 'Email subject line',
    content TEXT NOT NULL COMMENT 'Email content',
    created_by CHAR(36) NULL COMMENT 'User who created the campaign',
    sent_date TIMESTAMP NULL COMMENT 'When the campaign was sent',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation timestamp',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_language (language),
    INDEX idx_sent_date (sent_date),
    INDEX idx_created_by (created_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Newsletter campaigns with UUID keys';

-- Down Migration
-- DROP TABLE IF EXISTS newsletter_campaigns;
