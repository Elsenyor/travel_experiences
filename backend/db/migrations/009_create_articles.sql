-- Migration: Create articles table
-- Description: Creates main articles table for the blog
-- Date: 2024-01-20
-- Author: System
-- Dependencies: 001_create_users_table.sql

-- Up Migration
CREATE TABLE IF NOT EXISTS articles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    author_id INT NOT NULL COMMENT 'Reference to article author',
    featured_image VARCHAR(255) COMMENT 'Main article image URL',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Down Migration
-- DROP TABLE IF EXISTS articles;
