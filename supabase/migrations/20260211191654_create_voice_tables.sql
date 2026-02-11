CREATE TABLE IF NOT EXISTS voice_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  full_name TEXT,
  job_title TEXT,
  company TEXT,
  industry TEXT,
  bio TEXT,
  expertise_topics TEXT[] DEFAULT '{}',
  tone_preferences TEXT[] DEFAULT '{}',
  target_audience TEXT,
  personal_values TEXT[] DEFAULT '{}',
  positioning_statement TEXT,
  preferred_language TEXT DEFAULT 'de',
  preferred_emojis TEXT DEFAULT 'minimal' CHECK (preferred_emojis IN ('none', 'minimal', 'moderate')),
  hashtag_style TEXT DEFAULT 'trending' CHECK (hashtag_style IN ('branded', 'trending', 'niche')),
  default_cta_style TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE voice_profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'voice_profiles' AND policyname = 'Users can view own voice profile') THEN
    CREATE POLICY "Users can view own voice profile" ON voice_profiles FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'voice_profiles' AND policyname = 'Users can insert own voice profile') THEN
    CREATE POLICY "Users can insert own voice profile" ON voice_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'voice_profiles' AND policyname = 'Users can update own voice profile') THEN
    CREATE POLICY "Users can update own voice profile" ON voice_profiles FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'voice_profiles' AND policyname = 'Users can delete own voice profile') THEN
    CREATE POLICY "Users can delete own voice profile" ON voice_profiles FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS example_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES voice_profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  platform TEXT DEFAULT 'linkedin',
  performance_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE example_posts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'example_posts' AND policyname = 'Users can manage own example posts') THEN
    CREATE POLICY "Users can manage own example posts" ON example_posts FOR ALL USING (
      profile_id IN (SELECT id FROM voice_profiles WHERE user_id = auth.uid())
    );
  END IF;
END $$;
