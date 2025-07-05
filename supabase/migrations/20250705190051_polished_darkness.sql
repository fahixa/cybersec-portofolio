/*
  # Create missing tables and fix relationships

  1. New Tables
    - `articles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `title` (text, required)
      - `slug` (text, unique)
      - `excerpt` (text)
      - `content` (text, required)
      - `category` (text)
      - `featured` (boolean, default false)
      - `published` (boolean, default false)
      - `read_time` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Table Updates
    - Add foreign key relationship between `certifications` and `profiles`
    - Ensure all tables have proper RLS policies

  3. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for public read access to published content
*/

-- Create articles table
CREATE TABLE IF NOT EXISTS articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  slug text UNIQUE,
  excerpt text,
  content text NOT NULL,
  category text,
  featured boolean DEFAULT false,
  published boolean DEFAULT false,
  read_time integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add foreign key relationship between certifications and profiles if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'certifications_user_id_fkey' 
    AND table_name = 'certifications'
  ) THEN
    ALTER TABLE certifications 
    ADD CONSTRAINT certifications_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Enable RLS on articles table
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Ensure RLS is enabled on other tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE writeups ENABLE ROW LEVEL SECURITY;

-- Articles policies
CREATE POLICY "Users can read published articles"
  ON articles
  FOR SELECT
  TO public
  USING (published = true);

CREATE POLICY "Users can manage own articles"
  ON articles
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Profiles policies (if not already exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' AND policyname = 'Users can read all profiles'
  ) THEN
    CREATE POLICY "Users can read all profiles"
      ON profiles
      FOR SELECT
      TO public
      USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' AND policyname = 'Users can manage own profile'
  ) THEN
    CREATE POLICY "Users can manage own profile"
      ON profiles
      FOR ALL
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Certifications policies (if not already exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'certifications' AND policyname = 'Users can read all certifications'
  ) THEN
    CREATE POLICY "Users can read all certifications"
      ON certifications
      FOR SELECT
      TO public
      USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'certifications' AND policyname = 'Users can manage own certifications'
  ) THEN
    CREATE POLICY "Users can manage own certifications"
      ON certifications
      FOR ALL
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Writeups policies (if not already exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'writeups' AND policyname = 'Users can read published writeups'
  ) THEN
    CREATE POLICY "Users can read published writeups"
      ON writeups
      FOR SELECT
      TO public
      USING (published = true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'writeups' AND policyname = 'Users can manage own writeups'
  ) THEN
    CREATE POLICY "Users can manage own writeups"
      ON writeups
      FOR ALL
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS articles_user_id_idx ON articles(user_id);
CREATE INDEX IF NOT EXISTS articles_published_idx ON articles(published);
CREATE INDEX IF NOT EXISTS articles_featured_idx ON articles(featured);
CREATE INDEX IF NOT EXISTS articles_category_idx ON articles(category);
CREATE INDEX IF NOT EXISTS articles_slug_idx ON articles(slug);
CREATE INDEX IF NOT EXISTS articles_created_at_idx ON articles(created_at);

-- Update function for updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger for articles updated_at
DROP TRIGGER IF EXISTS update_articles_updated_at ON articles;
CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();