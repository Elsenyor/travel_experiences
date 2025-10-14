-- Migration: Populate slug fields for existing data
-- Description: Generate slugs for existing trips and articles based on their titles
-- Date: 2024-01-20
-- Updated: 2025-01-10 - Simplified for mysql2 compatibility
-- Author: System
-- MySQL Version: 8.0.36
--
-- Note: This migration is safe to run even if there are no records yet.
-- New records will have slugs generated automatically by the application.

-- Populate slugs for trips (using Spanish titles)
UPDATE trips t
INNER JOIN trip_translations tt ON t.id = tt.trip_id AND tt.language = 'es'
SET t.slug = CONCAT(
    LOWER(REGEXP_REPLACE(
        REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
            tt.title,
            'á', 'a'), 'é', 'e'), 'í', 'i'), 'ó', 'o'), 'ú', 'u'), 'ñ', 'n'), 'ü', 'u'
        ),
        '[^a-z0-9]+', '-'
    )),
    '-', SUBSTRING(t.id, 1, 8)
)
WHERE t.slug IS NULL;

-- Populate slugs for trips without Spanish translation (fallback to English)
UPDATE trips t
LEFT JOIN trip_translations tt_es ON t.id = tt_es.trip_id AND tt_es.language = 'es'
INNER JOIN trip_translations tt_en ON t.id = tt_en.trip_id AND tt_en.language = 'en'
SET t.slug = CONCAT(
    LOWER(REGEXP_REPLACE(
        REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
            tt_en.title,
            'á', 'a'), 'é', 'e'), 'í', 'i'), 'ó', 'o'), 'ú', 'u'), 'ñ', 'n'), 'ü', 'u'
        ),
        '[^a-z0-9]+', '-'
    )),
    '-', SUBSTRING(t.id, 1, 8)
)
WHERE t.slug IS NULL AND tt_es.id IS NULL;

-- Populate slugs for articles (using Spanish titles)
UPDATE articles a
INNER JOIN article_translations at ON a.id = at.article_id AND at.language = 'es'
SET a.slug = CONCAT(
    LOWER(REGEXP_REPLACE(
        REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
            at.title,
            'á', 'a'), 'é', 'e'), 'í', 'i'), 'ó', 'o'), 'ú', 'u'), 'ñ', 'n'), 'ü', 'u'
        ),
        '[^a-z0-9]+', '-'
    )),
    '-', SUBSTRING(a.id, 1, 8)
)
WHERE a.slug IS NULL;

-- Populate slugs for articles without Spanish translation (fallback to English)
UPDATE articles a
LEFT JOIN article_translations at_es ON a.id = at_es.article_id AND at_es.language = 'es'
INNER JOIN article_translations at_en ON a.id = at_en.article_id AND at_en.language = 'en'
SET a.slug = CONCAT(
    LOWER(REGEXP_REPLACE(
        REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
            at_en.title,
            'á', 'a'), 'é', 'e'), 'í', 'i'), 'ó', 'o'), 'ú', 'u'), 'ñ', 'n'), 'ü', 'u'
        ),
        '[^a-z0-9]+', '-'
    )),
    '-', SUBSTRING(a.id, 1, 8)
)
WHERE a.slug IS NULL AND at_es.id IS NULL;

