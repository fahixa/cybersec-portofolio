/*
  # Complete Database Schema Setup

  1. New Tables
    - `profiles` - User profile information
    - `certifications` - Professional certifications linked to profiles
    - `writeups` - CTF and bug bounty writeups
    - `articles` - Blog articles and tutorials

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for public to read published content

  3. Performance
    - Add indexes for frequently queried columns
    - Add updated_at triggers for automatic timestamp updates

  4. Data Integrity
    - Add foreign key constraints
    - Add check constraints for enums
    - Set appropriate defaults
*/

-- Create custom types/enums
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
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
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
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT profiles_user_id_unique UNIQUE (user_id)
);

-- Create certifications table (depends on profiles)
CREATE TABLE IF NOT EXISTS certifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  issuer text NOT NULL,
  validation_url text NOT NULL,
  logo_url text NOT NULL,
  issue_date date NOT NULL,
  expiry_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create writeups table
CREATE TABLE IF NOT EXISTS writeups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  excerpt text NOT NULL,
  content text NOT NULL,
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
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  excerpt text NOT NULL,
  content text NOT NULL,
  category article_category DEFAULT 'tutorial',
  featured boolean DEFAULT false,
  published boolean DEFAULT false,
  read_time integer DEFAULT 1,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE writeups ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "Users can read all profiles" ON profiles;
CREATE POLICY "Users can read all profiles"
  ON profiles
  FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "Users can manage own profile" ON profiles;
CREATE POLICY "Users can manage own profile"
  ON profiles
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Certifications policies
DROP POLICY IF EXISTS "Users can read all certifications" ON certifications;
CREATE POLICY "Users can read all certifications"
  ON certifications
  FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "Users can manage own certifications" ON certifications;
CREATE POLICY "Users can manage own certifications"
  ON certifications
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = certifications.profile_id 
      AND profiles.user_id = auth.uid()
    )
  );

-- Writeups policies
DROP POLICY IF EXISTS "Users can read published writeups" ON writeups;
CREATE POLICY "Users can read published writeups"
  ON writeups
  FOR SELECT
  TO public
  USING (published = true);

DROP POLICY IF EXISTS "Users can manage own writeups" ON writeups;
CREATE POLICY "Users can manage own writeups"
  ON writeups
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Articles policies
DROP POLICY IF EXISTS "Users can read published articles" ON articles;
CREATE POLICY "Users can read published articles"
  ON articles
  FOR SELECT
  TO public
  USING (published = true);

DROP POLICY IF EXISTS "Users can manage own articles" ON articles;
CREATE POLICY "Users can manage own articles"
  ON articles
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS profiles_user_id_idx ON profiles(user_id);
CREATE INDEX IF NOT EXISTS certifications_profile_id_idx ON certifications(profile_id);
CREATE INDEX IF NOT EXISTS writeups_user_id_idx ON writeups(user_id);
CREATE INDEX IF NOT EXISTS writeups_published_idx ON writeups(published);
CREATE INDEX IF NOT EXISTS writeups_category_idx ON writeups(category);
CREATE INDEX IF NOT EXISTS writeups_difficulty_idx ON writeups(difficulty);
CREATE INDEX IF NOT EXISTS writeups_slug_idx ON writeups(slug);
CREATE INDEX IF NOT EXISTS writeups_created_at_idx ON writeups(created_at);
CREATE INDEX IF NOT EXISTS articles_user_id_idx ON articles(user_id);
CREATE INDEX IF NOT EXISTS articles_published_idx ON articles(published);
CREATE INDEX IF NOT EXISTS articles_featured_idx ON articles(featured);
CREATE INDEX IF NOT EXISTS articles_category_idx ON articles(category);
CREATE INDEX IF NOT EXISTS articles_slug_idx ON articles(slug);
CREATE INDEX IF NOT EXISTS articles_created_at_idx ON articles(created_at);

-- Create or replace function for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at columns
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_certifications_updated_at ON certifications;
CREATE TRIGGER update_certifications_updated_at
  BEFORE UPDATE ON certifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_writeups_updated_at ON writeups;
CREATE TRIGGER update_writeups_updated_at
  BEFORE UPDATE ON writeups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_articles_updated_at ON articles;
CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data (optional - for testing)
-- You can remove this section if you don't want sample data

-- Sample profile (will be created when user signs up)
-- Sample writeup
-- Sample article
-- Sample certification