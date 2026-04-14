-- ============================================
-- MOOSEEKA V2 — Portfolio & Experience Migration
-- Run this in Supabase SQL Editor
-- ============================================

-- ── Experiences (Trayectoria) ──────────────────────────
CREATE TABLE IF NOT EXISTS experiences (
  id          uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id  uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type        text NOT NULL DEFAULT 'trabajo',
  title       text NOT NULL,
  company     text NOT NULL,
  start_month text,
  start_year  text NOT NULL,
  end_month   text,
  end_year    text,
  current     boolean DEFAULT false,
  description text,
  link        text,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Experiences are public"
  ON experiences FOR SELECT USING (true);

CREATE POLICY "Users can manage own experiences"
  ON experiences FOR ALL
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

-- ── Portfolio items (Portafolio musical) ───────────────
CREATE TABLE IF NOT EXISTS portfolio_items (
  id          uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id  uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title       text NOT NULL,
  type        text NOT NULL DEFAULT 'single',
  year        text,
  role        text,
  cover_url   text,
  link        text,
  description text,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Portfolio items are public"
  ON portfolio_items FOR SELECT USING (true);

CREATE POLICY "Users can manage own portfolio"
  ON portfolio_items FOR ALL
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

-- ── Storage bucket for portfolio covers ───────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio', 'portfolio', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Portfolio covers are public" ON storage.objects
  FOR SELECT USING (bucket_id = 'portfolio');

CREATE POLICY "Users can upload own portfolio covers" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'portfolio' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update own portfolio covers" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'portfolio' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
