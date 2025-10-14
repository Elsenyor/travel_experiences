-- Migration: Create article translations table
-- Description: Creates table for multilingual article content
-- Date: 2024-01-20
-- Updated: 2025-01-10 - Using UUIDs
-- Author: System
-- Dependencies: 009_create_articles.sql
-- MySQL Version: 8.0.36

-- Up Migration
CREATE TABLE IF NOT EXISTS article_translations (
    id CHAR(36) NOT NULL PRIMARY KEY COMMENT 'Translation UUID',
    article_id CHAR(36) NOT NULL COMMENT 'Reference to parent article',
    language VARCHAR(2) NOT NULL COMMENT 'Language code (es, en, etc)',
    title VARCHAR(200) NOT NULL COMMENT 'Translated article title',
    content TEXT NOT NULL COMMENT 'Translated article content',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation timestamp',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
    UNIQUE INDEX idx_article_lang (article_id, language),
    INDEX idx_language (language)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Article translations with UUID keys';

-- Down Migration
-- DROP TABLE IF EXISTS article_translations;
