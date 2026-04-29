-- scripts/init.sql
-- This runs automatically on first database startup

-- Enable the UUID extension (we'll use UUIDs as primary keys — safer than auto-increment IDs)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pg_trgm for fast text search (useful for property search later)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Log that it worked
DO $$
BEGIN
  RAISE NOTICE 'Database initialized with extensions: uuid-ossp, pg_trgm';
END $$;