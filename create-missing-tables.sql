-- Run this script in Supabase SQL editor to create missing tables

-- Create user_profiles table if not exists
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone_number VARCHAR(20),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create feedback table if not exists
CREATE TABLE IF NOT EXISTS feedback (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    message TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    user_email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create email_signups table if not exists  
CREATE TABLE IF NOT EXISTS email_signups (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create shared_checklists table if not exists
CREATE TABLE IF NOT EXISTS shared_checklists (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    car_id UUID REFERENCES cars(id) ON DELETE CASCADE NOT NULL,
    share_token VARCHAR(100) NOT NULL UNIQUE,
    permission_type VARCHAR(20) CHECK (permission_type IN ('view', 'edit')) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    accessed_count INTEGER DEFAULT 0
);

-- Create user_invitations table if not exists
CREATE TABLE IF NOT EXISTS user_invitations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    car_id UUID REFERENCES cars(id) ON DELETE CASCADE NOT NULL,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('owner', 'contributor', 'viewer')) NOT NULL,
    invitation_token VARCHAR(100) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
    invited_by UUID REFERENCES auth.users(id) NOT NULL,
    accepted_at TIMESTAMP WITH TIME ZONE,
    accepted_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(car_id, email)
);

-- Create indexes if not exists
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at);
CREATE INDEX IF NOT EXISTS idx_email_signups_email ON email_signups(email);
CREATE INDEX IF NOT EXISTS idx_shared_checklists_token ON shared_checklists(share_token);
CREATE INDEX IF NOT EXISTS idx_shared_checklists_car_id ON shared_checklists(car_id);
CREATE INDEX IF NOT EXISTS idx_user_invitations_token ON user_invitations(invitation_token);
CREATE INDEX IF NOT EXISTS idx_user_invitations_car_id ON user_invitations(car_id);
CREATE INDEX IF NOT EXISTS idx_user_invitations_email ON user_invitations(email);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_signups ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for feedback
DROP POLICY IF EXISTS "Anyone can submit feedback" ON feedback;
CREATE POLICY "Anyone can submit feedback" ON feedback
    FOR INSERT WITH CHECK (true);

-- RLS Policies for email signups
DROP POLICY IF EXISTS "Anyone can signup for email" ON email_signups;
CREATE POLICY "Anyone can signup for email" ON email_signups
    FOR INSERT WITH CHECK (true);

-- RLS Policies for shared checklists
DROP POLICY IF EXISTS "Car owners and contributors can create shares" ON shared_checklists;
CREATE POLICY "Car owners and contributors can create shares" ON shared_checklists
    FOR INSERT WITH CHECK (
        car_id IN (
            SELECT car_id FROM car_permissions 
            WHERE user_id = auth.uid() AND role IN ('owner', 'contributor')
        )
    );

DROP POLICY IF EXISTS "Car owners and contributors can view their shares" ON shared_checklists;
CREATE POLICY "Car owners and contributors can view their shares" ON shared_checklists
    FOR SELECT USING (
        car_id IN (
            SELECT car_id FROM car_permissions 
            WHERE user_id = auth.uid() AND role IN ('owner', 'contributor')
        )
    );

DROP POLICY IF EXISTS "Car owners and contributors can update their shares" ON shared_checklists;
CREATE POLICY "Car owners and contributors can update their shares" ON shared_checklists
    FOR UPDATE USING (
        car_id IN (
            SELECT car_id FROM car_permissions 
            WHERE user_id = auth.uid() AND role IN ('owner', 'contributor')
        )
    );

DROP POLICY IF EXISTS "Car owners and contributors can delete their shares" ON shared_checklists;
CREATE POLICY "Car owners and contributors can delete their shares" ON shared_checklists
    FOR DELETE USING (
        car_id IN (
            SELECT car_id FROM car_permissions 
            WHERE user_id = auth.uid() AND role IN ('owner', 'contributor')
        )
    );

-- RLS Policies for user invitations
DROP POLICY IF EXISTS "Car owners can create invitations" ON user_invitations;
CREATE POLICY "Car owners can create invitations" ON user_invitations
    FOR INSERT WITH CHECK (
        car_id IN (
            SELECT car_id FROM car_permissions 
            WHERE user_id = auth.uid() AND role = 'owner'
        )
    );

DROP POLICY IF EXISTS "Car owners can view their invitations" ON user_invitations;
CREATE POLICY "Car owners can view their invitations" ON user_invitations
    FOR SELECT USING (
        car_id IN (
            SELECT car_id FROM car_permissions 
            WHERE user_id = auth.uid() AND role = 'owner'
        )
    );

DROP POLICY IF EXISTS "Car owners can update their invitations" ON user_invitations;
CREATE POLICY "Car owners can update their invitations" ON user_invitations
    FOR UPDATE USING (
        car_id IN (
            SELECT car_id FROM car_permissions 
            WHERE user_id = auth.uid() AND role = 'owner'
        )
    );

DROP POLICY IF EXISTS "Car owners can delete their invitations" ON user_invitations;
CREATE POLICY "Car owners can delete their invitations" ON user_invitations
    FOR DELETE USING (
        car_id IN (
            SELECT car_id FROM car_permissions 
            WHERE user_id = auth.uid() AND role = 'owner'
        )
    );

DROP POLICY IF EXISTS "Invited users can view their invitations" ON user_invitations;
CREATE POLICY "Invited users can view their invitations" ON user_invitations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.email = user_invitations.email
        )
    );

DROP POLICY IF EXISTS "Invited users can accept their invitations" ON user_invitations;
CREATE POLICY "Invited users can accept their invitations" ON user_invitations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.email = user_invitations.email
        )
    );