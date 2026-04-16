-- Add audio columns to posts
ALTER TABLE posts ADD COLUMN IF NOT EXISTS audio_url  text;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS audio_name text;
