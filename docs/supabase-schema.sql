-- Supabase Schema for Bilboko Doinuak
-- Run this in your Supabase SQL Editor to set up the required tables

-- =============================================================================
-- PROFILES TABLE
-- Stores user profile information
-- =============================================================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  age_range TEXT CHECK (age_range IN ('under_18', '18_30', '31_50', '51_65', 'over_65')),
  gender TEXT CHECK (gender IN ('female', 'male', 'non_binary')),
  barrio TEXT CHECK (barrio IN (
    'san_ignacio', 'ibarrekolanda', 'elegorrieta', 'otro_bilbao', 'otro_municipio'
  )),
  barrio_otro TEXT, -- For specifying "which neighborhood/municipality" when otro_bilbao or otro_municipio is selected
  profile_completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- =============================================================================
-- PROGRESS TABLE
-- Stores user game progress including XP, level, badges, and game history
-- =============================================================================

CREATE TABLE IF NOT EXISTS progress (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  odisea2xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  coins INTEGER NOT NULL DEFAULT 0,
  badges JSONB NOT NULL DEFAULT '[]'::JSONB,
  games_played JSONB NOT NULL DEFAULT '[]'::JSONB,
  daily_missions JSONB,
  unlocked_sounds TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read their own progress
CREATE POLICY "Users can read own progress"
  ON progress
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own progress
CREATE POLICY "Users can insert own progress"
  ON progress
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own progress
CREATE POLICY "Users can update own progress"
  ON progress
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- INDEXES
-- =============================================================================

-- Index for faster profile lookups by age range (for analytics)
CREATE INDEX IF NOT EXISTS idx_profiles_age_range ON profiles(age_range);

-- Index for faster profile lookups by barrio (for analytics)
CREATE INDEX IF NOT EXISTS idx_profiles_barrio ON profiles(barrio);

-- Index for faster progress lookups by level (for leaderboards)
CREATE INDEX IF NOT EXISTS idx_progress_level ON progress(level);

-- Index for faster progress lookups by XP (for leaderboards)
CREATE INDEX IF NOT EXISTS idx_progress_xp ON progress(odisea2xp);

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update progress.updated_at on every update
DROP TRIGGER IF EXISTS update_progress_updated_at ON progress;
CREATE TRIGGER update_progress_updated_at
  BEFORE UPDATE ON progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- SETUP GOOGLE AUTH
-- =============================================================================
--
-- To enable Google OAuth, go to your Supabase dashboard:
-- 1. Navigate to Authentication > Providers
-- 2. Enable Google provider
-- 3. Add your Google OAuth credentials:
--    - Client ID (from Google Cloud Console)
--    - Client Secret (from Google Cloud Console)
-- 4. Add your app URLs to the redirect URLs list
--
-- Google Cloud Console setup:
-- 1. Go to https://console.cloud.google.com/
-- 2. Create a new project or select existing
-- 3. Enable the Google+ API
-- 4. Go to Credentials > Create Credentials > OAuth Client ID
-- 5. Application type: Web application
-- 6. Add authorized JavaScript origins: your app URL
-- 7. Add authorized redirect URIs:
--    https://your-project-id.supabase.co/auth/v1/callback
--
-- =============================================================================

-- =============================================================================
-- SAMPLE QUERIES (for reference)
-- =============================================================================

-- Get user profile with progress
-- SELECT p.*, pr.odisea2xp, pr.level, pr.badges
-- FROM profiles p
-- LEFT JOIN progress pr ON p.id = pr.user_id
-- WHERE p.id = auth.uid();

-- Get leaderboard (top 10 by XP)
-- SELECT p.display_name, p.avatar_url, pr.odisea2xp, pr.level
-- FROM profiles p
-- JOIN progress pr ON p.id = pr.user_id
-- WHERE p.profile_completed = true
-- ORDER BY pr.odisea2xp DESC
-- LIMIT 10;

-- Count users by barrio
-- SELECT barrio, COUNT(*) as count
-- FROM profiles
-- WHERE profile_completed = true
-- GROUP BY barrio
-- ORDER BY count DESC;
