-- ============================================
-- MOOSEEKA V2 — ONBOARDING MIGRATION
-- Run this in Supabase SQL Editor
-- ============================================

-- Add onboarding columns to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS roles     text[]  DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS genres    text[]  DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS objetivo  text,
  ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;

-- Optional: create avatars storage bucket
-- (skip if you already have one)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: anyone can view avatars
CREATE POLICY "Avatars are public" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- Storage policy: users can upload their own avatar
CREATE POLICY "Users can upload own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policy: users can update their own avatar
CREATE POLICY "Users can update own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
