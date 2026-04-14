-- ============================================
-- MOOSEEKA V2 — Social Links Migration
-- Run this in Supabase SQL Editor
-- ============================================

-- Add social_links column to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS social_links jsonb DEFAULT '{}';

-- Allow users to update their own social_links (already covered by existing policy)
-- "Users can update own profile" policy handles all columns
