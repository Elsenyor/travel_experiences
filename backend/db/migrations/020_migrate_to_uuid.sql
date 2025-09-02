-- Migration: Migrate to UUID
-- Description: Changes primary keys from INT to UUID (CHAR(36))
-- Date: 2024-06-10
-- Author: System

-- Up Migration

-- Modify users table to use UUIDs
ALTER TABLE users 
    MODIFY COLUMN id CHAR(36) NOT NULL;

-- Modify bookings table to use UUIDs
ALTER TABLE bookings 
    MODIFY COLUMN id CHAR(36) NOT NULL,
    MODIFY COLUMN user_id CHAR(36) NOT NULL,
    MODIFY COLUMN trip_id CHAR(36) NOT NULL;

-- Modify trips table to use UUIDs
ALTER TABLE trips 
    MODIFY COLUMN id CHAR(36) NOT NULL,
    MODIFY COLUMN created_by CHAR(36) NULL;

-- Modify trip_translations table to use UUIDs
ALTER TABLE trip_translations 
    MODIFY COLUMN trip_id CHAR(36) NOT NULL;

-- Modify trip_images table to use UUIDs
ALTER TABLE trip_images 
    MODIFY COLUMN id CHAR(36) NOT NULL,
    MODIFY COLUMN trip_id CHAR(36) NOT NULL;

-- Modify available_dates table to use UUIDs
ALTER TABLE available_dates 
    MODIFY COLUMN id CHAR(36) NOT NULL,
    MODIFY COLUMN trip_id CHAR(36) NOT NULL;

-- Modify articles table to use UUIDs
ALTER TABLE articles 
    MODIFY COLUMN id CHAR(36) NOT NULL,
    MODIFY COLUMN author_id CHAR(36) NULL;

-- Modify article_translations table to use UUIDs
ALTER TABLE article_translations 
    MODIFY COLUMN article_id CHAR(36) NOT NULL;

-- Modify tags table to use UUIDs
ALTER TABLE tags 
    MODIFY COLUMN id CHAR(36) NOT NULL;

-- Modify article_tags table to use UUIDs
ALTER TABLE article_tags 
    MODIFY COLUMN article_id CHAR(36) NOT NULL,
    MODIFY COLUMN tag_id CHAR(36) NOT NULL;

-- Modify newsletter_subscribers table to use UUIDs
ALTER TABLE newsletter_subscribers 
    MODIFY COLUMN id CHAR(36) NOT NULL;

-- Modify newsletter_campaigns table to use UUIDs
ALTER TABLE newsletter_campaigns 
    MODIFY COLUMN id CHAR(36) NOT NULL,
    MODIFY COLUMN created_by CHAR(36) NULL;

-- Modify newsletter_sends table to use UUIDs
ALTER TABLE newsletter_sends 
    MODIFY COLUMN id CHAR(36) NOT NULL,
    MODIFY COLUMN campaign_id CHAR(36) NOT NULL,
    MODIFY COLUMN subscriber_id CHAR(36) NOT NULL;

-- Modify chat_conversations table to use UUIDs
ALTER TABLE chat_conversations 
    MODIFY COLUMN id CHAR(36) NOT NULL,
    MODIFY COLUMN user_id CHAR(36) NULL;

-- Modify chat_messages table to use UUIDs
ALTER TABLE chat_messages 
    MODIFY COLUMN id CHAR(36) NOT NULL,
    MODIFY COLUMN conversation_id CHAR(36) NOT NULL;

-- Modify faqs table to use UUIDs
ALTER TABLE faqs 
    MODIFY COLUMN id CHAR(36) NOT NULL;

-- Modify faq_translations table to use UUIDs
ALTER TABLE faq_translations 
    MODIFY COLUMN faq_id CHAR(36) NOT NULL;

-- Down Migration
-- Due to the complexity of this migration, there is no down migration provided.
-- To revert, you would need to restore from a backup.