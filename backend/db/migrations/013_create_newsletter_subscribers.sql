-- Migration: Create newsletter subscribers table
-- Description: Creates table for newsletter subscription management
-- Date: 2024-01-20
-- Updated: 2025-01-10 - Using UUIDs
-- Author: System
-- MySQL Version: 8.0.36

-- Up Migration
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id CHAR(36) NOT NULL PRIMARY KEY COMMENT 'Subscriber UUID',
    email VARCHAR(100) NOT NULL UNIQUE COMMENT 'Subscriber email address',
    preferred_language VARCHAR(2) DEFAULT 'es' COMMENT 'Preferred language for newsletters',
    status ENUM('active', 'inactive') DEFAULT 'active' COMMENT 'Subscription status',
    subscription_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Subscription timestamp',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',
    UNIQUE INDEX idx_subscriber_email (email),
    INDEX idx_status (status),
    INDEX idx_preferred_language (preferred_language)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Newsletter subscribers with UUID keys';

-- Down Migration
-- DROP TABLE IF EXISTS newsletter_subscribers;
