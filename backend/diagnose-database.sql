-- Database Diagnostic Script
-- Run this to see what foreign keys actually exist in your database

-- Show all foreign keys in the database
SELECT 
    CONSTRAINT_NAME,
    TABLE_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'asia_experiences'
AND REFERENCED_TABLE_NAME IS NOT NULL
ORDER BY TABLE_NAME, CONSTRAINT_NAME;

-- Show data types of ID columns
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    DATA_TYPE,
    COLUMN_TYPE
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'asia_experiences'
AND COLUMN_NAME IN ('id', 'user_id', 'trip_id', 'article_id', 'created_by', 'author_id')
ORDER BY TABLE_NAME, COLUMN_NAME;



