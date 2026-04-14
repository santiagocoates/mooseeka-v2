-- ============================================
-- MOOSEEKA V2 — RLS Fix
-- Run this in Supabase SQL Editor
-- ============================================

-- Allow users to insert their own profile row
-- (needed for upsert fallback if trigger failed)
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
