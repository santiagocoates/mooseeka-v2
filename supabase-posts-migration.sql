-- ============================================
-- MOOSEEKA V2 — Posts / Feed Migration
-- Run this in Supabase SQL Editor
-- ============================================

CREATE TABLE IF NOT EXISTS posts (
  id          uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id  uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type        text NOT NULL DEFAULT 'logro',
  -- types: logro | lanzamiento | video | busqueda
  content     text NOT NULL,
  link        text,
  image_url   text,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Posts are public"
  ON posts FOR SELECT USING (true);

CREATE POLICY "Users can manage own posts"
  ON posts FOR ALL
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

-- Storage bucket for post images
INSERT INTO storage.buckets (id, name, public)
VALUES ('posts', 'posts', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Post images are public" ON storage.objects
  FOR SELECT USING (bucket_id = 'posts');

CREATE POLICY "Users can upload own post images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'posts' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own post images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'posts' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
