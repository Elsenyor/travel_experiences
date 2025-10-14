-- Fix Migration 020 - Remove failed migration record
-- This script cleans up failed migration attempts

-- Step 1: Check current state
SELECT 'Current migration 20 state:' as info;
SELECT * FROM schema_versions WHERE version = 20;

-- Step 2: Delete the failed migration record
DELETE FROM schema_versions WHERE version = 20;

-- Step 3: Verify deletion
SELECT 'After deletion (should be 0 rows):' as info;
SELECT * FROM schema_versions WHERE version = 20;

-- Step 4: Show current schema version
SELECT 'Current database version:' as info;
SELECT MAX(version) as current_version FROM schema_versions WHERE success = 1;

