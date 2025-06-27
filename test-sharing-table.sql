-- Test if shared_checklists table exists and has proper structure

-- Check if table exists
SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_name = 'shared_checklists';

-- Check table structure if it exists
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'shared_checklists'
ORDER BY ordinal_position;

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'shared_checklists';

-- Check if we have any data
SELECT COUNT(*) as total_shares FROM shared_checklists;

-- Try to create a simple test record (this will show permission errors if any)
-- Note: Replace with a real car_id and user_id from your database
-- INSERT INTO shared_checklists (car_id, share_token, permission_type, created_by)
-- VALUES ('your-car-id', 'test-token-123', 'view', 'your-user-id');