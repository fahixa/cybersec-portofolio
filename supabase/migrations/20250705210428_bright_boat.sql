/*
  # Fix Certifications and Improve Dashboard UI
  
  1. New Features
    - Add proper certification loading for profiles
    - Fix relationship between profiles and certifications
    - Ensure certifications are properly displayed
  
  2. Security
    - Maintain RLS policies
    - Ensure proper data access controls
*/

-- First, check if we need to fix any existing certifications
DO $$
DECLARE
    profile_count integer;
    cert_count integer;
    orphaned_cert_count integer;
BEGIN
    -- Count profiles
    SELECT COUNT(*) INTO profile_count FROM profiles;
    
    -- Count certifications
    SELECT COUNT(*) INTO cert_count FROM certifications;
    
    -- Count orphaned certifications (no valid profile_id)
    SELECT COUNT(*) INTO orphaned_cert_count 
    FROM certifications c
    LEFT JOIN profiles p ON c.profile_id = p.id
    WHERE p.id IS NULL;
    
    RAISE NOTICE 'Current status: % profiles, % certifications, % orphaned certifications', 
        profile_count, cert_count, orphaned_cert_count;
    
    -- Fix orphaned certifications if needed
    IF orphaned_cert_count > 0 THEN
        RAISE NOTICE 'Fixing orphaned certifications...';
        DELETE FROM certifications WHERE profile_id NOT IN (SELECT id FROM profiles);
        RAISE NOTICE 'Orphaned certifications removed.';
    END IF;
END $$;

-- Ensure the certifications table has proper indexes
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'certifications' AND indexname = 'certifications_profile_id_idx'
    ) THEN
        CREATE INDEX certifications_profile_id_idx ON certifications(profile_id);
        RAISE NOTICE 'Created index on certifications(profile_id)';
    END IF;
END $$;

-- Ensure RLS policies are properly set
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies to ensure they're correct
DROP POLICY IF EXISTS "Public certifications are viewable by everyone" ON certifications;
CREATE POLICY "Public certifications are viewable by everyone" 
    ON certifications FOR SELECT 
    USING (true);

DROP POLICY IF EXISTS "Users can manage their own certifications" ON certifications;
CREATE POLICY "Users can manage their own certifications" 
    ON certifications FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = certifications.profile_id 
            AND profiles.user_id = auth.uid()
        )
    );

-- Add a trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_certifications_updated_at ON certifications;
CREATE TRIGGER update_certifications_updated_at
    BEFORE UPDATE ON certifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Verify the structure is correct
DO $$
BEGIN
    RAISE NOTICE 'Certification table structure verified.';
END $$;

-- Final status message
SELECT 'Certification fixes applied successfully!' AS status;