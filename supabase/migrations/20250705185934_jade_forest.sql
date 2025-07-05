/*
  # Complete Database Schema Setup

  1. New Tables
    - `profiles` - User profile information with social links and bio
    - `certifications` - Professional certifications linked to profiles
    - `articles` - Blog articles with categories and featured status
    - `writeups` - CTF and bug bounty writeups with difficulty levels

  2. Enums
    - `article_category` - Categories for articles (tutorial, news, opinion, tools, career)
    - `writeup_category` - Categories for writeups (ctf, bug-bounty)
    - `writeup_difficulty` - Difficulty levels (easy, medium, hard)

  3. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for public read access to published content

  4. Relationships
    - profiles.user_id -> auth.users.id (one-to-one)
    - certifications.profile_id -> profiles.id (one-to-many)
    - articles.user_id -> auth.users.id (one-to-many)
    - writeups.user_id -> auth.users.id (one-to-many)
*/

-- Create enums
CREATE TYPE IF NOT EXISTS article_category AS ENUM ('tutorial', 'news', 'opinion', 'tools', 'career');
CREATE TYPE IF NOT EXISTS writeup_category AS ENUM ('ctf', 'bug-bounty');
CREATE TYPE IF NOT EXISTS writeup_difficulty AS ENUM ('easy', 'medium', 'hard');

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  name text NOT NULL DEFAULT '',
  title text NOT NULL DEFAULT '',
  bio text NOT NULL DEFAULT '',
  experience text NOT NULL DEFAULT '',
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
  issue_date text NOT NULL,
  expiry_date text,
  validation_url text NOT NULL,
  logo_url text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create articles table
CREATE TABLE IF NOT EXISTS articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  excerpt text NOT NULL,
  content text NOT NULL,
  category article_category DEFAULT 'tutorial',
  tags text[] DEFAULT '{}',
  featured boolean DEFAULT false,
  published boolean DEFAULT false,
  read_time integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create writeups table
CREATE TABLE IF NOT EXISTS writeups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
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

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE writeups ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY IF NOT EXISTS "Public profiles are viewable by everyone"
  ON profiles
  FOR SELECT
  USING (true);

CREATE POLICY IF NOT EXISTS "Users can insert their own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete their own profile"
  ON profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Certifications policies
CREATE POLICY IF NOT EXISTS "Certifications are viewable by everyone"
  ON certifications
  FOR SELECT
  USING (true);

CREATE POLICY IF NOT EXISTS "Users can insert certifications for their profile"
  ON certifications
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = certifications.profile_id 
      AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "Users can update their own certifications"
  ON certifications
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = certifications.profile_id 
      AND profiles.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = certifications.profile_id 
      AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "Users can delete their own certifications"
  ON certifications
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = certifications.profile_id 
      AND profiles.user_id = auth.uid()
    )
  );

-- Articles policies
CREATE POLICY IF NOT EXISTS "Published articles are viewable by everyone"
  ON articles
  FOR SELECT
  USING (published = true OR auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert their own articles"
  ON articles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update their own articles"
  ON articles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete their own articles"
  ON articles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Writeups policies
CREATE POLICY IF NOT EXISTS "Published writeups are viewable by everyone"
  ON writeups
  FOR SELECT
  USING (published = true OR auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert their own writeups"
  ON writeups
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update their own writeups"
  ON writeups
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete their own writeups"
  ON writeups
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS profiles_user_id_idx ON profiles(user_id);
CREATE INDEX IF NOT EXISTS certifications_profile_id_idx ON certifications(profile_id);
CREATE INDEX IF NOT EXISTS articles_user_id_idx ON articles(user_id);
CREATE INDEX IF NOT EXISTS articles_published_idx ON articles(published);
CREATE INDEX IF NOT EXISTS articles_featured_idx ON articles(featured);
CREATE INDEX IF NOT EXISTS articles_category_idx ON articles(category);
CREATE INDEX IF NOT EXISTS articles_slug_idx ON articles(slug);
CREATE INDEX IF NOT EXISTS writeups_user_id_idx ON writeups(user_id);
CREATE INDEX IF NOT EXISTS writeups_published_idx ON writeups(published);
CREATE INDEX IF NOT EXISTS writeups_category_idx ON writeups(category);
CREATE INDEX IF NOT EXISTS writeups_difficulty_idx ON writeups(difficulty);
CREATE INDEX IF NOT EXISTS writeups_slug_idx ON writeups(slug);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER IF NOT EXISTS update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_certifications_updated_at
  BEFORE UPDATE ON certifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_writeups_updated_at
  BEFORE UPDATE ON writeups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();