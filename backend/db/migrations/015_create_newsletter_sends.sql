-- Migration: Create newsletter sends table
-- Description: Creates table to track individual newsletter sends
-- Date: 2024-01-20
-- Author: System
-- Dependencies: 013_create_newsletter_subscribers.sql, 014_create_newsletter_campaigns.sql

-- Up Migration
CREATE TABLE IF NOT EXISTS newsletter_sends (
    id INT AUTO_INCREMENT PRIMARY KEY,
    campaign_id INT NOT NULL COMMENT 'Reference to campaign',
    subscriber_id INT NOT NULL COMMENT 'Reference to subscriber',
    status ENUM('pending', 'sent', 'failed') DEFAULT 'pending' COMMENT 'Send status',
    sent_date TIMESTAMP NULL COMMENT 'When the email was sent',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (campaign_id) REFERENCES newsletter_campaigns(id) ON DELETE CASCADE,
    FOREIGN KEY (subscriber_id) REFERENCES newsletter_subscribers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Down Migration
-- DROP TABLE IF EXISTS newsletter_sends;
