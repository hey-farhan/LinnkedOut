-- Clear ALL data from the database
-- Run this in your Supabase SQL editor to start fresh

-- Delete in correct order (respecting foreign keys)
-- First delete media (which references youtube_media, reddit_media, and media_embeddings)
DELETE FROM media;

-- Then delete the platform-specific tables
DELETE FROM youtube_media;
DELETE FROM reddit_media;

-- Finally delete embeddings
DELETE FROM media_embeddings;

-- Reset the sequences (auto-increment IDs) to start from 1
ALTER SEQUENCE media_id_seq RESTART WITH 1;
ALTER SEQUENCE youtube_media_id_seq RESTART WITH 1;
ALTER SEQUENCE reddit_media_id_seq RESTART WITH 1;
ALTER SEQUENCE media_embeddings_id_seq RESTART WITH 1;

-- Verify all tables are empty
SELECT 'media' as table_name, COUNT(*) as count FROM media
UNION ALL
SELECT 'youtube_media', COUNT(*) FROM youtube_media
UNION ALL
SELECT 'reddit_media', COUNT(*) FROM reddit_media
UNION ALL
SELECT 'media_embeddings', COUNT(*) FROM media_embeddings;
