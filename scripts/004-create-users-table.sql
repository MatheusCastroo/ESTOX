-- Create users table for PHP authentication
-- This replaces Supabase Auth

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Update stores table to reference users table instead of auth.users
-- Note: You may need to migrate existing data if you have users in Supabase Auth
-- ALTER TABLE stores DROP CONSTRAINT stores_user_id_fkey;
-- ALTER TABLE stores ADD CONSTRAINT stores_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;



