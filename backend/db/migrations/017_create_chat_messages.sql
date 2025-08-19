-- Migration: Create chat messages table
-- Description: Creates table for individual chat messages
-- Date: 2024-01-20
-- Author: System
-- Dependencies: 016_create_chat_conversations.sql

-- Up Migration
CREATE TABLE IF NOT EXISTS chat_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    conversation_id INT NOT NULL COMMENT 'Reference to parent conversation',
    sender ENUM('user', 'bot', 'admin') NOT NULL COMMENT 'Who sent the message',
    message TEXT NOT NULL COMMENT 'Message content',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES chat_conversations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Down Migration
-- DROP TABLE IF EXISTS chat_messages;
