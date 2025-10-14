-- Migration: Create newsletter sends table
-- Description: Creates table to track individual newsletter sends
-- Date: 2024-01-20
-- Updated: 2025-01-10 - Using UUIDs
-- Author: System
-- Dependencies: 013_create_newsletter_subscribers.sql, 014_create_newsletter_campaigns.sql
-- MySQL Version: 8.0.36

-- Up Migration
CREATE TABLE IF NOT EXISTS newsletter_sends (
    id CHAR(36) NOT NULL PRIMARY KEY COMMENT 'Send record UUID',
    campaign_id CHAR(36) NOT NULL COMMENT 'Reference to campaign',
    subscriber_id CHAR(36) NOT NULL COMMENT 'Reference to subscriber',
    status ENUM('pending', 'sent', 'failed') DEFAULT 'pending' COMMENT 'Send status',
    sent_date TIMESTAMP NULL COMMENT 'When the email was sent',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation timestamp',
    FOREIGN KEY (campaign_id) REFERENCES newsletter_campaigns(id) ON DELETE CASCADE,
    FOREIGN KEY (subscriber_id) REFERENCES newsletter_subscribers(id) ON DELETE CASCADE,
    INDEX idx_campaign_id (campaign_id),
    INDEX idx_subscriber_id (subscriber_id),
    INDEX idx_status (status),
    INDEX idx_sent_date (sent_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Newsletter send tracking with UUID keys';

-- Down Migration
-- DROP TABLE IF EXISTS newsletter_sends;
