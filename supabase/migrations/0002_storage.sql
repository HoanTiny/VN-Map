-- ============================================================================
-- Map-VN — Phase 2.5: Supabase Storage bucket for user-uploaded photos
-- ============================================================================
-- Run in Supabase SQL Editor. Idempotent — safe to re-run.
-- ============================================================================

-- Create the photos bucket (public read so images are served without auth).
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'photos',
  'photos',
  true,
  1572864, -- 1.5 MB limit per file
  ARRAY['image/jpeg','image/png','image/webp','image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Anyone can read objects in the photos bucket.
DROP POLICY IF EXISTS "photos public read" ON storage.objects;
CREATE POLICY "photos public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'photos');

-- Authenticated users can upload into their own user-id folder.
DROP POLICY IF EXISTS "photos auth upload" ON storage.objects;
CREATE POLICY "photos auth upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'photos'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can delete only their own files.
DROP POLICY IF EXISTS "photos delete own" ON storage.objects;
CREATE POLICY "photos delete own" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
