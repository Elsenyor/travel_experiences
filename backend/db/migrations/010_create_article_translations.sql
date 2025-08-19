-- Migration: Create article translations table
-- Description: Creates table for multilingual article content
-- Date: 2024-01-20
-- Author: System
-- Dependencies: 009_create_articles.sql

-- Up Migration
CREATE TABLE IF NOT EXISTS article_translations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    article_id INT NOT NULL COMMENT 'Reference to parent article',
    language VARCHAR(2) NOT NULL COMMENT 'Language code (es, en, etc)',
    title VARCHAR(200) NOT NULL COMMENT 'Translated article title',
    content TEXT NOT NULL COMMENT 'Translated article content',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
    UNIQUE INDEX idx_article_lang (article_id, language)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Down Migration
-- DROP TABLE IF EXISTS article_translations;
