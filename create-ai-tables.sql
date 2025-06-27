-- Create AI-related tables for Ajokunto

-- User subscriptions table for AI usage tracking
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_type TEXT NOT NULL DEFAULT 'free' CHECK (subscription_type IN ('free', 'premium', 'pro')),
    ai_queries_limit INTEGER NOT NULL DEFAULT 3,
    ai_queries_used INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- AI conversations table to store chat history and analysis results
CREATE TABLE IF NOT EXISTS ai_conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    car_id UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
    conversation_type TEXT NOT NULL CHECK (conversation_type IN ('chat', 'analysis')),
    input_data JSONB,
    ai_response JSONB,
    tokens_used INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Car models knowledge base
CREATE TABLE IF NOT EXISTS car_models (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    year_from INTEGER NOT NULL,
    year_to INTEGER NOT NULL,
    engine_types TEXT[],
    fuel_type TEXT,
    common_mileage_ranges JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(make, model, year_from, year_to)
);

-- Common issues for car models
CREATE TABLE IF NOT EXISTS common_issues (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    car_model_id UUID NOT NULL REFERENCES car_models(id) ON DELETE CASCADE,
    issue_category TEXT NOT NULL,
    description TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    typical_mileage_range JSONB,
    estimated_cost_range TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recall information
CREATE TABLE IF NOT EXISTS recalls (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    car_model_id UUID NOT NULL REFERENCES car_models(id) ON DELETE CASCADE,
    recall_number TEXT,
    description TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('safety', 'emission', 'other')),
    affected_years INTEGER[],
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inspection statistics for models
CREATE TABLE IF NOT EXISTS inspection_statistics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    car_model_id UUID NOT NULL REFERENCES car_models(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    total_inspections INTEGER DEFAULT 0,
    pass_rate NUMERIC(5,2),
    common_failures JSONB,
    average_repair_cost NUMERIC(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(car_model_id, year)
);

-- Maintenance schedules
CREATE TABLE IF NOT EXISTS maintenance_schedules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    car_model_id UUID NOT NULL REFERENCES car_models(id) ON DELETE CASCADE,
    maintenance_type TEXT NOT NULL,
    interval_km INTEGER,
    interval_months INTEGER,
    description TEXT,
    estimated_cost TEXT,
    urgency TEXT CHECK (urgency IN ('routine', 'important', 'critical')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RPC functions for AI usage management (DROP IF EXISTS first)
DROP FUNCTION IF EXISTS check_ai_usage_limit(UUID);
CREATE OR REPLACE FUNCTION check_ai_usage_limit(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    subscription_record RECORD;
BEGIN
    -- Get or create user subscription
    SELECT * INTO subscription_record
    FROM user_subscriptions
    WHERE user_id = user_uuid;
    
    -- If no subscription exists, create a default free one
    IF NOT FOUND THEN
        INSERT INTO user_subscriptions (user_id, subscription_type, ai_queries_limit, ai_queries_used)
        VALUES (user_uuid, 'free', 3, 0);
        
        RETURN TRUE;
    END IF;
    
    -- Check if user has queries left
    RETURN subscription_record.ai_queries_used < subscription_record.ai_queries_limit;
END;
$$;

DROP FUNCTION IF EXISTS increment_ai_usage(UUID);
CREATE OR REPLACE FUNCTION increment_ai_usage(user_uuid UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE user_subscriptions 
    SET ai_queries_used = ai_queries_used + 1,
        updated_at = NOW()
    WHERE user_id = user_uuid;
    
    -- If no record exists, create one
    IF NOT FOUND THEN
        INSERT INTO user_subscriptions (user_id, subscription_type, ai_queries_limit, ai_queries_used)
        VALUES (user_uuid, 'free', 3, 1);
    END IF;
END;
$$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_car_id ON ai_conversations(car_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_type ON ai_conversations(conversation_type);
CREATE INDEX IF NOT EXISTS idx_car_models_make_model ON car_models(make, model);
CREATE INDEX IF NOT EXISTS idx_common_issues_car_model_id ON common_issues(car_model_id);
CREATE INDEX IF NOT EXISTS idx_recalls_car_model_id ON recalls(car_model_id);
CREATE INDEX IF NOT EXISTS idx_inspection_statistics_car_model_id ON inspection_statistics(car_model_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_schedules_car_model_id ON maintenance_schedules(car_model_id);

-- Enable RLS on tables
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE common_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE recalls ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_schedules ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (drop existing ones first to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own subscription" ON user_subscriptions;
CREATE POLICY "Users can view own subscription" ON user_subscriptions
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own subscription" ON user_subscriptions;
CREATE POLICY "Users can update own subscription" ON user_subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own conversations" ON ai_conversations;
CREATE POLICY "Users can view own conversations" ON ai_conversations
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own conversations" ON ai_conversations;
CREATE POLICY "Users can insert own conversations" ON ai_conversations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Car knowledge tables are read-only for all authenticated users
DROP POLICY IF EXISTS "Authenticated users can read car models" ON car_models;
CREATE POLICY "Authenticated users can read car models" ON car_models
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can read common issues" ON common_issues;
CREATE POLICY "Authenticated users can read common issues" ON common_issues
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can read recalls" ON recalls;
CREATE POLICY "Authenticated users can read recalls" ON recalls
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can read inspection stats" ON inspection_statistics;
CREATE POLICY "Authenticated users can read inspection stats" ON inspection_statistics
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can read maintenance schedules" ON maintenance_schedules;
CREATE POLICY "Authenticated users can read maintenance schedules" ON maintenance_schedules
    FOR SELECT USING (auth.role() = 'authenticated');