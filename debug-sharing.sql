-- Debug script to check sharing functionality database setup
-- Run these queries in Supabase SQL editor to troubleshoot sharing issues

-- 1. Check if shared_checklists table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'shared_checklists';

-- 2. Check table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'shared_checklists' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Check RLS policies for shared_checklists
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'shared_checklists';

-- 4. Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'shared_checklists';

-- 5. Test inserting a sample record (replace with actual values)
-- Note: Only run this after confirming the table exists and user has proper permissions
/*
INSERT INTO shared_checklists (
    car_id, 
    share_token, 
    permission_type, 
    created_by
) VALUES (
    'your-car-id-here',
    'test-token-123',
    'view',
    auth.uid()
);
*/

-- 6. Check existing records
SELECT id, car_id, share_token, permission_type, created_by, created_at, accessed_count
FROM shared_checklists
ORDER BY created_at DESC
LIMIT 10;

-- 7. Check user permissions for cars (to ensure user can create shares)
SELECT cp.car_id, cp.role, c.registration_number
FROM car_permissions cp
JOIN cars c ON c.id = cp.car_id
WHERE cp.user_id = auth.uid()
AND cp.role IN ('owner', 'contributor');