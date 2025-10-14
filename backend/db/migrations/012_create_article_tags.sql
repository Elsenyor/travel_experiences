-- Migration: Create article tags relation table
-- Description: Creates many-to-many relationship between articles and tags
-- Date: 2024-01-20
-- Updated: 2025-01-10 - Using UUIDs
-- Author: System
-- Dependencies: 009_create_articles.sql, 011_create_tags.sql
-- MySQL Version: 8.0.36

-- Up Migration
CREATE TABLE IF NOT EXISTS article_tags (
    article_id CHAR(36) NOT NULL COMMENT 'Reference to article',
    tag_id CHAR(36) NOT NULL COMMENT 'Reference to tag',
    PRIMARY KEY (article_id, tag_id),
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
    INDEX idx_article_id (article_id),
    INDEX idx_tag_id (tag_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Article-Tag relationship with UUID keys';

-- Down Migration
-- DROP TABLE IF EXISTS article_tags;
