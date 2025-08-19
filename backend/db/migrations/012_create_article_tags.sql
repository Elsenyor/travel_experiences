-- Migration: Create article tags relation table
-- Description: Creates many-to-many relationship between articles and tags
-- Date: 2024-01-20
-- Author: System
-- Dependencies: 009_create_articles.sql, 011_create_tags.sql

-- Up Migration
CREATE TABLE IF NOT EXISTS article_tags (
    article_id INT NOT NULL COMMENT 'Reference to article',
    tag_id INT NOT NULL COMMENT 'Reference to tag',
    PRIMARY KEY (article_id, tag_id),
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Down Migration
-- DROP TABLE IF EXISTS article_tags;
