-- AI Features and Car Knowledge Database Schema
-- Run this in Supabase SQL Editor

-- User subscriptions for premium AI features
CREATE TABLE user_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_type TEXT NOT NULL CHECK (subscription_type IN ('free', 'premium', 'pro')),
  ai_queries_used INTEGER DEFAULT 0,
  ai_queries_limit INTEGER DEFAULT 3, -- Free: 3, Premium: 100, Pro: unlimited (-1)
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Car models and specifications
CREATE TABLE car_models (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year_from INTEGER,
  year_to INTEGER,
  engine_type TEXT,
  fuel_type TEXT,
  transmission_type TEXT,
  body_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(make, model, year_from, engine_type)
);

-- Common issues for car models
CREATE TABLE common_issues (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  car_model_id UUID REFERENCES car_models(id) ON DELETE CASCADE,
  issue_category TEXT NOT NULL, -- 'engine', 'transmission', 'electrical', etc.
  issue_title TEXT NOT NULL,
  issue_description TEXT,
  frequency_percentage DECIMAL(5,2), -- How often this issue occurs
  severity_level INTEGER CHECK (severity_level >= 1 AND severity_level <= 5), -- 1=minor, 5=critical
  average_repair_cost DECIMAL(10,2),
  mileage_range_from INTEGER,
  mileage_range_to INTEGER,
  symptoms TEXT[], -- Array of symptoms
  prevention_tips TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recalls and safety notices
CREATE TABLE recalls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  car_model_id UUID REFERENCES car_models(id) ON DELETE CASCADE,
  recall_number TEXT UNIQUE,
  recall_date DATE,
  issue_title TEXT NOT NULL,
  issue_description TEXT,
  severity_level INTEGER CHECK (severity_level >= 1 AND severity_level <= 5),
  affected_vehicles_count INTEGER,
  fix_available BOOLEAN DEFAULT FALSE,
  fix_description TEXT,
  recall_source TEXT, -- 'EU', 'NHTSA', 'Trafi', etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inspection statistics by model
CREATE TABLE inspection_statistics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  car_model_id UUID REFERENCES car_models(id) ON DELETE CASCADE,
  inspection_year INTEGER,
  total_inspections INTEGER,
  pass_rate DECIMAL(5,2), -- Percentage that passed
  common_failure_reasons TEXT[], -- Array of common failure reasons
  average_mileage_at_inspection INTEGER,
  data_source TEXT, -- Where this data comes from
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Maintenance schedules and recommendations
CREATE TABLE maintenance_schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  car_model_id UUID REFERENCES car_models(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL, -- 'oil_change', 'brake_pads', 'timing_belt', etc.
  recommended_mileage INTEGER,
  recommended_months INTEGER,
  service_description TEXT,
  average_cost DECIMAL(10,2),
  criticality_level INTEGER CHECK (criticality_level >= 1 AND criticality_level <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI conversation history
CREATE TABLE ai_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  car_id UUID REFERENCES cars(id) ON DELETE CASCADE,
  conversation_type TEXT CHECK (conversation_type IN ('analysis', 'chat', 'questions')),
  input_data JSONB, -- User's inspection data or question
  ai_response JSONB, -- AI's response with questions/analysis
  tokens_used INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE common_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE recalls ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;

-- User subscriptions - users can only see their own
CREATE POLICY "Users can manage their own subscriptions" ON user_subscriptions
    FOR ALL USING (user_id = auth.uid());

-- Car knowledge tables - readable by authenticated users
CREATE POLICY "Authenticated users can read car models" ON car_models
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read common issues" ON common_issues
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read recalls" ON recalls
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read inspection stats" ON inspection_statistics
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read maintenance schedules" ON maintenance_schedules
    FOR SELECT USING (auth.role() = 'authenticated');

-- AI conversations - users can only see their own
CREATE POLICY "Users can manage their own AI conversations" ON ai_conversations
    FOR ALL USING (user_id = auth.uid());

-- Insert default free subscription for existing users
INSERT INTO user_subscriptions (user_id, subscription_type, ai_queries_limit)
SELECT id, 'free', 3 
FROM auth.users 
WHERE id NOT IN (SELECT user_id FROM user_subscriptions);

-- Function to check AI usage limits
CREATE OR REPLACE FUNCTION check_ai_usage_limit(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    subscription RECORD;
BEGIN
    SELECT * INTO subscription 
    FROM user_subscriptions 
    WHERE user_id = user_uuid;
    
    IF NOT FOUND THEN
        -- Create free subscription if none exists
        INSERT INTO user_subscriptions (user_id, subscription_type, ai_queries_limit)
        VALUES (user_uuid, 'free', 3);
        RETURN TRUE;
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

-- Function to increment AI usage
CREATE OR REPLACE FUNCTION increment_ai_usage(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE user_subscriptions 
    SET ai_queries_used = ai_queries_used + 1,
        updated_at = NOW()
    WHERE user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;