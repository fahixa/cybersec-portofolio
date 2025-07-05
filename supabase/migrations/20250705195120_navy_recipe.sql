-- Create Database Tables and Schema
-- Run this first before adding data

-- Create custom types
DO $$ BEGIN
    CREATE TYPE writeup_category AS ENUM ('ctf', 'bug-bounty');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE writeup_difficulty AS ENUM ('easy', 'medium', 'hard');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE article_category AS ENUM ('tutorial', 'news', 'opinion', 'tools', 'career');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  name text NOT NULL,
  title text NOT NULL,
  bio text NOT NULL,
  experience text DEFAULT '',
  skills text[] DEFAULT '{}',
  avatar_url text,
  github_url text,
  linkedin_url text,
  twitter_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create certifications table
CREATE TABLE IF NOT EXISTS certifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  issuer text NOT NULL,
  validation_url text NOT NULL,
  issue_date date NOT NULL,
  expiry_date date,
  logo_url text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create writeups table
CREATE TABLE IF NOT EXISTS writeups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  content text NOT NULL,
  excerpt text NOT NULL,
  category writeup_category DEFAULT 'ctf',
  difficulty writeup_difficulty DEFAULT 'medium',
  tags text[] DEFAULT '{}',
  published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create articles table
CREATE TABLE IF NOT EXISTS articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  content text NOT NULL,
  excerpt text NOT NULL,
  category article_category DEFAULT 'tutorial',
  tags text[] DEFAULT '{}',
  published boolean DEFAULT false,
  featured boolean DEFAULT false,
  read_time integer DEFAULT 5,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE writeups ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public read access
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Public certifications are viewable by everyone" ON certifications;
CREATE POLICY "Public certifications are viewable by everyone" ON certifications FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage their own certifications" ON certifications;
CREATE POLICY "Users can manage their own certifications" ON certifications FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = certifications.profile_id AND profiles.user_id = auth.uid())
);

DROP POLICY IF EXISTS "Published writeups are viewable by everyone" ON writeups;
CREATE POLICY "Published writeups are viewable by everyone" ON writeups FOR SELECT USING (published = true OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own writeups" ON writeups;
CREATE POLICY "Users can manage their own writeups" ON writeups FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Published articles are viewable by everyone" ON articles;
CREATE POLICY "Published articles are viewable by everyone" ON articles FOR SELECT USING (published = true OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own articles" ON articles;
CREATE POLICY "Users can manage their own articles" ON articles FOR ALL USING (auth.uid() = user_id);

SELECT 'Tables created successfully!' AS status;