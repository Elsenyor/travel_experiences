-- Migration: Create FAQ translations table
-- Description: Creates table for multilingual FAQ content
-- Date: 2024-01-20
-- Author: System
-- Dependencies: 018_create_faqs.sql

-- Up Migration
CREATE TABLE IF NOT EXISTS faq_translations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    faq_id INT NOT NULL COMMENT 'Reference to parent FAQ',
    language VARCHAR(2) NOT NULL COMMENT 'Language code (es, en, etc)',
    question TEXT NOT NULL COMMENT 'Translated question',
    answer TEXT NOT NULL COMMENT 'Translated answer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (faq_id) REFERENCES faqs(id) ON DELETE CASCADE,
    UNIQUE INDEX idx_faq_lang (faq_id, language)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Down Migration
-- DROP TABLE IF EXISTS faq_translations;
