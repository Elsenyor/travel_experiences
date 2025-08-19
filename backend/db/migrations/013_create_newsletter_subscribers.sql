-- Migration: Create newsletter subscribers table
-- Description: Creates table for newsletter subscription management
-- Date: 2024-01-20
-- Author: System

-- Up Migration
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE COMMENT 'Subscriber email address',
    preferred_language VARCHAR(2) DEFAULT 'es' COMMENT 'Preferred language for newsletters',
    status ENUM('active', 'inactive') DEFAULT 'active' COMMENT 'Subscription status',
    subscription_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE INDEX idx_subscriber_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Down Migration
-- DROP TABLE IF EXISTS newsletter_subscribers;
