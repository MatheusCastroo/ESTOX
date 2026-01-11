-- AutoStock Database Migration
-- Script 010: Add role column to users table
-- MySQL Version (for phpMyAdmin)

-- Add role column if it doesn't exist
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user' COMMENT 'Role: user, admin' AFTER name;

-- Add index for role
ALTER TABLE users 
  ADD INDEX IF NOT EXISTS idx_users_role (role);

-- Update existing users to 'user' role (default)
UPDATE users SET role = 'user' WHERE role IS NULL OR role = '';

-- Optional: Set specific users as admin (update email accordingly)
-- UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';

