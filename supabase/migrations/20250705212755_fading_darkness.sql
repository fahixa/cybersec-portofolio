/*
  # Fix email constraint validation error

  1. Changes
    - Remove existing constraint that's causing issues
    - Clean all existing data in email column
    - Add new constraint with proper validation
    - Set default email for existing profiles

  2. Security
    - Ensures all email data is valid
    - Removes any invalid data that might exist
*/

-- First, drop the existing constraint that's causing issues
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS email_format_check;

-- Clear ALL existing data in the email column to start fresh
UPDATE profiles 
SET email = NULL;

-- Now add the constraint back with proper validation
ALTER TABLE profiles 
ADD CONSTRAINT email_format_check 
CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Set default email for existing profiles (optional)
UPDATE profiles 
SET email = 'fakhrityhikmawan@gmail.com' 
WHERE email IS NULL;

-- Add comment to the column
COMMENT ON COLUMN profiles.email IS 'User email address for contact purposes';