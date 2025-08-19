-- Migration: Create chat conversations table
-- Description: Creates table for chat session management
-- Date: 2024-01-20
-- Author: System
-- Dependencies: 001_create_users_table.sql

-- Up Migration
CREATE TABLE IF NOT EXISTS chat_conversations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL COMMENT 'Reference to user (NULL for anonymous chats)',
    status ENUM('open', 'closed') DEFAULT 'open' COMMENT 'Conversation status',
    start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'When the chat started',
    end_date TIMESTAMP NULL COMMENT 'When the chat ended',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Down Migration
-- DROP TABLE IF EXISTS chat_conversations;
