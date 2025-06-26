-- Debug AI issue - Check what's missing

-- 1. Check if RPC functions exist
SELECT routine_name, routine_type
FROM information_schema.routines 
WHERE routine_name IN ('check_ai_usage_limit', 'increment_ai_usage');

-- 2. Check user_subscriptions table
SELECT COUNT(*) as subscription_count FROM user_subscriptions;

-- 3. Check current user (replace with actual user ID from auth.users)
SELECT id, email FROM auth.users LIMIT 3;

-- 4. Check if subscription exists for a user (replace USER_ID)
-- SELECT * FROM user_subscriptions WHERE user_id = 'YOUR_USER_ID_HERE';

-- 5. Test RPC function manually (replace USER_ID)
-- SELECT check_ai_usage_limit('YOUR_USER_ID_HERE');

-- 6. Create subscription if missing (replace USER_ID)
-- INSERT INTO user_subscriptions (user_id, subscription_type, ai_queries_limit, ai_queries_used)
-- VALUES ('YOUR_USER_ID_HERE', 'free', 3, 0)
-- ON CONFLICT (user_id) DO UPDATE SET updated_at = NOW();