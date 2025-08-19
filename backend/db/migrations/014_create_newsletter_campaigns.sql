-- Migration: Create newsletter campaigns table
-- Description: Creates table for newsletter campaign management
-- Date: 2024-01-20
-- Author: System

-- Up Migration
CREATE TABLE IF NOT EXISTS newsletter_campaigns (
    id INT AUTO_INCREMENT PRIMARY KEY,
    language VARCHAR(2) NOT NULL COMMENT 'Campaign language',
    subject VARCHAR(200) NOT NULL COMMENT 'Email subject line',
    content TEXT NOT NULL COMMENT 'Email content',
    sent_date TIMESTAMP NULL COMMENT 'When the campaign was sent',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Down Migration
-- DROP TABLE IF EXISTS newsletter_campaigns;
