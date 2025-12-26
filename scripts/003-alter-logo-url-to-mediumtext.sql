-- Script 003: Alter logo_url field to MEDIUMTEXT
-- This allows storing larger base64 images (up to 16MB)
-- Run this if you're experiencing issues with logo images being truncated

ALTER TABLE stores MODIFY COLUMN logo_url MEDIUMTEXT;

