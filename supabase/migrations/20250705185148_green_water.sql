/*
  # Initial Database Schema for CyberSec Portfolio

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `title` (text)
      - `bio` (text)
      - `skills` (text array)
      - `experience` (text)
      - `avatar_url` (text, optional)
      - `github_url` (text, optional)
      - `linkedin_url` (text, optional)
      - `twitter_url` (text, optional)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `certifications`
      - `id` (uuid, primary key)
      - `profile_id` (uuid, references profiles)
      - `name` (text)
      - `issuer` (text)
      - `validation_url` (text)
      - `issue_date` (date)
      - `expiry_date` (date, optional)
      - `logo_url` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `writeups`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `title` (text)
      - `slug` (text, unique)
      - `content` (text)
      - `excerpt` (text)
      - `category` (enum: ctf, bug-bounty)
      - `difficulty` (enum: easy, medium, hard)
      - `tags` (text array)
      - `published` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `articles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `title` (text)
      - `slug` (text, unique)
      - `content` (text)
      - `excerpt` (text)
      - `category` (enum: tutorial, news, opinion, tools, career)
      - `tags` (text array)
      - `published` (boolean)
      - `featured` (boolean)
      - `read_time` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Secure data access patterns
    - Input validation constraints

  3. Performance
    - Add indexes for frequently queried columns
    - Optimize for search functionality
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE writeup_category AS ENUM ('ctf', 'bug-bounty');
CREATE TYPE writeup_difficulty AS ENUM ('easy', 'medium', 'hard');
CREATE TYPE article_category AS ENUM ('tutorial', 'news', 'opinion', 'tools', 'career');

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (length(name) >= 1 AND length(name) <= 100),
  title text NOT NULL CHECK (length(title) >= 1 AND length(title) <= 200),
  bio text NOT NULL CHECK (length(bio) >= 1 AND length(bio) <= 2000),
  skills text[] DEFAULT '{}',
  experience text DEFAULT '' CHECK (length(experience) <= 2000),
  avatar_url text CHECK (avatar_url ~ '^https?://.*' OR avatar_url IS NULL),
  github_url text CHECK (github_url ~ '^https?://.*' OR github_url IS NULL),
  linkedin_url text CHECK (linkedin_url ~ '^https?://.*' OR linkedin_url IS NULL),
  twitter_url text CHECK (twitter_url ~ '^https?://.*' OR twitter_url IS NULL),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Certifications table
CREATE TABLE IF NOT EXISTS certifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (length(name) >= 1 AND length(name) <= 200),
  issuer text NOT NULL CHECK (length(issuer) >= 1 AND length(issuer) <= 100),
  validation_url text NOT NULL CHECK (validation_url ~ '^https?://.*'),
  issue_date date NOT NULL,
  expiry_date date CHECK (expiry_date IS NULL OR expiry_date > issue_date),
  logo_url text NOT NULL CHECK (logo_url ~ '^https?://.*'),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Writeups table
CREATE TABLE IF NOT EXISTS writeups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL CHECK (length(title) >= 1 AND length(title) <= 200),
  slug text NOT NULL CHECK (slug ~ '^[a-z0-9-]+$' AND length(slug) >= 1 AND length(slug) <= 100),
  content text NOT NULL CHECK (length(content) >= 1),
  excerpt text NOT NULL CHECK (length(excerpt) >= 1 AND length(excerpt) <= 500),
  category writeup_category NOT NULL DEFAULT 'ctf',
  difficulty writeup_difficulty NOT NULL DEFAULT 'medium',
  tags text[] DEFAULT '{}',
  published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(slug)
);

-- Articles table
CREATE TABLE IF NOT EXISTS articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL CHECK (length(title) >= 1 AND length(title) <= 200),
  slug text NOT NULL CHECK (slug ~ '^[a-z0-9-]+$' AND length(slug) >= 1 AND length(slug) <= 100),
  content text NOT NULL CHECK (length(content) >= 1),
  excerpt text NOT NULL CHECK (length(excerpt) >= 1 AND length(excerpt) <= 500),
  category article_category NOT NULL DEFAULT 'tutorial',
  tags text[] DEFAULT '{}',
  published boolean DEFAULT false,
  featured boolean DEFAULT false,
  read_time integer DEFAULT 5 CHECK (read_time > 0 AND read_time <= 120),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(slug)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_certifications_profile_id ON certifications(profile_id);
CREATE INDEX IF NOT EXISTS idx_writeups_user_id ON writeups(user_id);
CREATE INDEX IF NOT EXISTS idx_writeups_published ON writeups(published);
CREATE INDEX IF NOT EXISTS idx_writeups_category ON writeups(category);
CREATE INDEX IF NOT EXISTS idx_writeups_slug ON writeups(slug);
CREATE INDEX IF NOT EXISTS idx_writeups_created_at ON writeups(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_user_id ON articles(user_id);
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published);
CREATE INDEX IF NOT EXISTS idx_articles_featured ON articles(featured);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON articles(created_at DESC);

-- Full-text search indexes
CREATE INDEX IF NOT EXISTS idx_writeups_search ON writeups USING gin(to_tsvector('english', title || ' ' || excerpt || ' ' || content));
CREATE INDEX IF NOT EXISTS idx_articles_search ON articles USING gin(to_tsvector('english', title || ' ' || excerpt || ' ' || content));

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE writeups ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profile"
  ON profiles FOR DELETE
  USING (auth.uid() = user_id);

-- Certifications policies
CREATE POLICY "Public certifications are viewable by everyone"
  ON certifications FOR SELECT
  USING (true);

CREATE POLICY "Users can manage certifications for their profile"
  ON certifications FOR ALL
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

-- Writeups policies
CREATE POLICY "Published writeups are viewable by everyone"
  ON writeups FOR SELECT
  USING (published = true OR auth.uid() = user_id);

CREATE POLICY "Users can insert their own writeups"
  ON writeups FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own writeups"
  ON writeups FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own writeups"
  ON writeups FOR DELETE
  USING (auth.uid() = user_id);

-- Articles policies
CREATE POLICY "Published articles are viewable by everyone"
  ON articles FOR SELECT
  USING (published = true OR auth.uid() = user_id);

CREATE POLICY "Users can insert their own articles"
  ON articles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own articles"
  ON articles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own articles"
  ON articles FOR DELETE
  USING (auth.uid() = user_id);

-- Create functions for updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_certifications_updated_at
  BEFORE UPDATE ON certifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_writeups_updated_at
  BEFORE UPDATE ON writeups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();