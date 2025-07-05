/*
  # Add email column to profiles table

  1. Changes
    - Add email column to profiles table
    - Add email validation constraint
    - Set default email for existing profiles
    - Remove twitter_url references if they exist

  2. Security
    - Email validation using regex pattern
    - Allow NULL values for optional email
*/

-- First, check if twitter_url column exists and drop it if it does
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'twitter_url'
  ) THEN
    ALTER TABLE profiles DROP COLUMN twitter_url;
  END IF;
END $$;

-- Add email column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'email'
  ) THEN
    ALTER TABLE profiles ADD COLUMN email text;
  END IF;
END $$;

-- Add email validation constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE constraint_name = 'email_format_check'
  ) THEN
    ALTER TABLE profiles 
    ADD CONSTRAINT email_format_check 
    CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
  END IF;
END $$;

-- Set default email for existing profiles
UPDATE profiles 
SET email = 'fakhrityhikmawan@gmail.com' 
WHERE email IS NULL;

-- Add comment to the column
COMMENT ON COLUMN profiles.email IS 'User email address for contact purposes';