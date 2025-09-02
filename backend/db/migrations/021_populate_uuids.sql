-- Migration: Populate UUIDs
-- Description: Populates UUID values for all tables
-- Date: 2024-06-10
-- Author: System
-- Dependencies: 020_migrate_to_uuid.sql

-- Up Migration

-- Update users table with UUIDs
UPDATE users SET id = UUID() WHERE id = '' OR id IS NULL;

-- Update trips table with UUIDs
UPDATE trips SET id = UUID() WHERE id = '' OR id IS NULL;

-- Update trip_translations table with UUIDs for foreign keys
-- This assumes trips table has already been updated with UUIDs
UPDATE trip_translations tt 
JOIN trips t ON tt.trip_id = '' OR tt.trip_id IS NULL
SET tt.trip_id = t.id;

-- Update bookings table with UUIDs
UPDATE bookings SET id = UUID() WHERE id = '' OR id IS NULL;

-- Update bookings table with UUIDs for foreign keys
-- This assumes users and trips tables have already been updated with UUIDs
UPDATE bookings b
JOIN users u ON b.user_id = '' OR b.user_id IS NULL
JOIN trips t ON b.trip_id = '' OR b.trip_id IS NULL
SET b.user_id = u.id, b.trip_id = t.id;

-- Update trip_images table with UUIDs
UPDATE trip_images SET id = UUID() WHERE id = '' OR id IS NULL;

-- Update trip_images table with UUIDs for foreign keys
-- This assumes trips table has already been updated with UUIDs
UPDATE trip_images ti
JOIN trips t ON ti.trip_id = '' OR ti.trip_id IS NULL
SET ti.trip_id = t.id;

-- Update available_dates table with UUIDs
UPDATE available_dates SET id = UUID() WHERE id = '' OR id IS NULL;

-- Update available_dates table with UUIDs for foreign keys
-- This assumes trips table has already been updated with UUIDs
UPDATE available_dates ad
JOIN trips t ON ad.trip_id = '' OR ad.trip_id IS NULL
SET ad.trip_id = t.id;

-- Update articles table with UUIDs
UPDATE articles SET id = UUID() WHERE id = '' OR id IS NULL;

-- Update articles table with UUIDs for foreign keys
-- This assumes users table has already been updated with UUIDs
UPDATE articles a
LEFT JOIN users u ON a.author_id = '' OR a.author_id IS NULL
SET a.author_id = u.id;

-- Update article_translations table with UUIDs for foreign keys
-- This assumes articles table has already been updated with UUIDs
UPDATE article_translations at
JOIN articles a ON at.article_id = '' OR at.article_id IS NULL
SET at.article_id = a.id;

-- Update tags table with UUIDs
UPDATE tags SET id = UUID() WHERE id = '' OR id IS NULL;

-- Update article_tags table with UUIDs for foreign keys
-- This assumes articles and tags tables have already been updated with UUIDs
UPDATE article_tags at
JOIN articles a ON at.article_id = '' OR at.article_id IS NULL
JOIN tags t ON at.tag_id = '' OR at.tag_id IS NULL
SET at.article_id = a.id, at.tag_id = t.id;

-- Update newsletter_subscribers table with UUIDs
UPDATE newsletter_subscribers SET id = UUID() WHERE id = '' OR id IS NULL;

-- Update newsletter_campaigns table with UUIDs
UPDATE newsletter_campaigns SET id = UUID() WHERE id = '' OR id IS NULL;

-- Update newsletter_campaigns table with UUIDs for foreign keys
-- This assumes users table has already been updated with UUIDs
UPDATE newsletter_campaigns nc
LEFT JOIN users u ON nc.created_by = '' OR nc.created_by IS NULL
SET nc.created_by = u.id;

-- Update newsletter_sends table with UUIDs
UPDATE newsletter_sends SET id = UUID() WHERE id = '' OR id IS NULL;

-- Update newsletter_sends table with UUIDs for foreign keys
-- This assumes newsletter_campaigns and newsletter_subscribers tables have already been updated with UUIDs
UPDATE newsletter_sends ns
JOIN newsletter_campaigns nc ON ns.campaign_id = '' OR ns.campaign_id IS NULL
JOIN newsletter_subscribers ns2 ON ns.subscriber_id = '' OR ns.subscriber_id IS NULL
SET ns.campaign_id = nc.id, ns.subscriber_id = ns2.id;

-- Update chat_conversations table with UUIDs
UPDATE chat_conversations SET id = UUID() WHERE id = '' OR id IS NULL;

-- Update chat_conversations table with UUIDs for foreign keys
-- This assumes users table has already been updated with UUIDs
UPDATE chat_conversations cc
LEFT JOIN users u ON cc.user_id = '' OR cc.user_id IS NULL
SET cc.user_id = u.id;

-- Update chat_messages table with UUIDs
UPDATE chat_messages SET id = UUID() WHERE id = '' OR id IS NULL;

-- Update chat_messages table with UUIDs for foreign keys
-- This assumes chat_conversations table has already been updated with UUIDs
UPDATE chat_messages cm
JOIN chat_conversations cc ON cm.conversation_id = '' OR cm.conversation_id IS NULL
SET cm.conversation_id = cc.id;

-- Update faqs table with UUIDs
UPDATE faqs SET id = UUID() WHERE id = '' OR id IS NULL;

-- Update faq_translations table with UUIDs for foreign keys
-- This assumes faqs table has already been updated with UUIDs
UPDATE faq_translations ft
JOIN faqs f ON ft.faq_id = '' OR ft.faq_id IS NULL
SET ft.faq_id = f.id;

-- Down Migration
-- Due to the complexity of this migration, there is no down migration provided.
-- To revert, you would need to restore from a backup.
