/*
  # Rename twitter_url column to email

  1. Changes
    - Rename `twitter_url` column to `email` in `profiles` table
    - Update column type to be more appropriate for email validation
    - Add email format validation constraint

  2. Data Migration
    - Preserve existing data during column rename
    - Clear existing twitter URLs as they're no longer relevant

  3. Security
    - Maintain existing RLS policies
    - No changes to permissions needed
*/

-- Rename the twitter_url column to email
ALTER TABLE profiles 
RENAME COLUMN twitter_url TO email;

-- Update the column type and add email validation
ALTER TABLE profiles 
ALTER COLUMN email TYPE text,
ADD CONSTRAINT email_format_check 
CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Clear existing data since it was Twitter URLs, not emails
UPDATE profiles 
SET email = NULL 
WHERE email IS NOT NULL AND email LIKE '%twitter.com%';

-- Add comment to the column
COMMENT ON COLUMN profiles.email IS 'User email address for contact purposes';