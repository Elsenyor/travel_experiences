-- Migration: Create FAQ translations table
-- Description: Creates table for multilingual FAQ content
-- Date: 2024-01-20
-- Updated: 2025-01-10 - Using UUIDs
-- Author: System
-- Dependencies: 018_create_faqs.sql
-- MySQL Version: 8.0.36

-- Up Migration
CREATE TABLE IF NOT EXISTS faq_translations (
    id CHAR(36) NOT NULL PRIMARY KEY COMMENT 'Translation UUID',
    faq_id CHAR(36) NOT NULL COMMENT 'Reference to parent FAQ',
    language VARCHAR(2) NOT NULL COMMENT 'Language code (es, en, etc)',
    question TEXT NOT NULL COMMENT 'Translated question',
    answer TEXT NOT NULL COMMENT 'Translated answer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation timestamp',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',
    FOREIGN KEY (faq_id) REFERENCES faqs(id) ON DELETE CASCADE,
    UNIQUE INDEX idx_faq_lang (faq_id, language),
    INDEX idx_language (language)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='FAQ translations with UUID keys';

-- Down Migration
-- DROP TABLE IF EXISTS faq_translations;
