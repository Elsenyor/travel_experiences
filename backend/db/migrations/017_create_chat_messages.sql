-- Migration: Create chat messages table
-- Description: Creates table for individual chat messages
-- Date: 2024-01-20
-- Updated: 2025-01-10 - Using UUIDs
-- Author: System
-- Dependencies: 016_create_chat_conversations.sql
-- MySQL Version: 8.0.36

-- Up Migration
CREATE TABLE IF NOT EXISTS chat_messages (
    id CHAR(36) NOT NULL PRIMARY KEY COMMENT 'Message UUID',
    conversation_id CHAR(36) NOT NULL COMMENT 'Reference to parent conversation',
    sender ENUM('user', 'bot', 'admin') NOT NULL COMMENT 'Who sent the message',
    message TEXT NOT NULL COMMENT 'Message content',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Message timestamp',
    FOREIGN KEY (conversation_id) REFERENCES chat_conversations(id) ON DELETE CASCADE,
    INDEX idx_conversation_id (conversation_id),
    INDEX idx_sender (sender),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Chat messages with UUID keys';

-- Down Migration
-- DROP TABLE IF EXISTS chat_messages;
