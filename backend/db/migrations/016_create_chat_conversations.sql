-- Migration: Create chat conversations table
-- Description: Creates table for chat session management
-- Date: 2024-01-20
-- Updated: 2025-01-10 - Using UUIDs
-- Author: System
-- Dependencies: 001_create_users_table.sql
-- MySQL Version: 8.0.36

-- Up Migration
CREATE TABLE IF NOT EXISTS chat_conversations (
    id CHAR(36) NOT NULL PRIMARY KEY COMMENT 'Conversation UUID',
    user_id CHAR(36) NULL COMMENT 'Reference to user (NULL for anonymous chats)',
    status ENUM('open', 'closed') DEFAULT 'open' COMMENT 'Conversation status',
    start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'When the chat started',
    end_date TIMESTAMP NULL COMMENT 'When the chat ended',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_start_date (start_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Chat conversations with UUID keys';

-- Down Migration
-- DROP TABLE IF EXISTS chat_conversations;
