-- Manual AI Fix - Run this if RPC functions are missing

-- Create user_subscriptions table if missing
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_type TEXT NOT NULL DEFAULT 'free' CHECK (subscription_type IN ('free', 'premium', 'pro')),
  ai_queries_used INTEGER DEFAULT 0,
  ai_queries_limit INTEGER DEFAULT 3,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Drop and recreate RLS policy
DROP POLICY IF EXISTS "Users can manage their own subscriptions" ON user_subscriptions;
CREATE POLICY "Users can manage their own subscriptions" ON user_subscriptions
    FOR ALL USING (user_id = auth.uid());

-- Create check function
DROP FUNCTION IF EXISTS check_ai_usage_limit(UUID);
CREATE OR REPLACE FUNCTION check_ai_usage_limit(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    subscription RECORD;
BEGIN
    -- Get or create subscription
    INSERT INTO user_subscriptions (user_id, subscription_type, ai_queries_limit, ai_queries_used)
    VALUES (user_uuid, 'free', 3, 0)
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Check usage
    SELECT * INTO subscription 
    FROM user_subscriptions 
    WHERE user_id = user_uuid;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Check if subscription is expired
    IF subscription.expires_at IS NOT NULL AND subscription.expires_at < NOW() THEN
        RETURN FALSE;
    END IF;
    
    -- Check usage limits (Pro has unlimited = -1)
    IF subscription.ai_queries_limit = -1 THEN
        RETURN TRUE;
    END IF;
    
    RETURN subscription.ai_queries_used < subscription.ai_queries_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create increment function
DROP FUNCTION IF EXISTS increment_ai_usage(UUID);
CREATE OR REPLACE FUNCTION increment_ai_usage(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE user_subscriptions 
    SET ai_queries_used = ai_queries_used + 1,
        updated_at = NOW()
    WHERE user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create free subscriptions for all existing users
INSERT INTO user_subscriptions (user_id, subscription_type, ai_queries_limit, ai_queries_used)
SELECT id, 'free', 3, 0 
FROM auth.users 
ON CONFLICT (user_id) DO NOTHING;