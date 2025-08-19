-- Create schema versions table if not exists
CREATE TABLE IF NOT EXISTS schema_versions (
    version INT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    checksum VARCHAR(64) NOT NULL COMMENT 'SHA256 of migration content'
);
