-- Test AI database setup
-- Run this to verify AI features are working

-- Check if tables exist
SELECT 'user_subscriptions' as table_name, count(*) as row_count FROM user_subscriptions
UNION ALL
SELECT 'car_models' as table_name, count(*) as row_count FROM car_models
UNION ALL
SELECT 'common_issues' as table_name, count(*) as row_count FROM common_issues
UNION ALL
SELECT 'recalls' as table_name, count(*) as row_count FROM recalls
UNION ALL
SELECT 'ai_conversations' as table_name, count(*) as row_count FROM ai_conversations;

-- Test functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name IN ('check_ai_usage_limit', 'increment_ai_usage');

-- Create test subscription if needed (replace with actual user ID)
-- INSERT INTO user_subscriptions (user_id, subscription_type, ai_queries_limit, ai_queries_used)
-- VALUES ('your-user-id-here', 'free', 3, 0)
-- ON CONFLICT (user_id) DO NOTHING;