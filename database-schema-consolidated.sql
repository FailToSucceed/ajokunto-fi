-- ===================================
-- AJOKUNTO.FI CONSOLIDATED DATABASE SCHEMA
-- ===================================
-- This file contains the complete database schema for Ajokunto.fi
-- Run this in Supabase SQL editor to create the complete database structure

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security by default
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

-- ===================================
-- CORE TABLES
-- ===================================

-- Cars table
CREATE TABLE IF NOT EXISTS cars (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    registration_number VARCHAR(20) NOT NULL UNIQUE,
    make VARCHAR(100),
    model VARCHAR(100),
    year INTEGER,
    mileage INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) NOT NULL
);

-- Car permissions table (Extended roles: owner, contributor, viewer, holder, buyer, inspector, mechanic, other)
CREATE TABLE IF NOT EXISTS car_permissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    car_id UUID REFERENCES cars(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role VARCHAR(20) CHECK (role IN ('owner', 'contributor', 'viewer', 'holder', 'buyer', 'inspector', 'mechanic', 'other')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(car_id, user_id)
);

-- User profiles table (Extended user information)
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone_number VARCHAR(20),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Checklist items table
CREATE TABLE IF NOT EXISTS checklist_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    car_id UUID REFERENCES cars(id) ON DELETE CASCADE NOT NULL,
    section VARCHAR(50) NOT NULL, -- documentation, exterior, interior, technical, test_drive, expert_review, cost_estimates, buyer_advice
    item_key VARCHAR(100) NOT NULL, -- unique identifier for the checklist item
    status VARCHAR(20) CHECK (status IN ('ok', 'warning', 'issue')),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    UNIQUE(car_id, section, item_key)
);

-- Maintenance records table
CREATE TABLE IF NOT EXISTS maintenance_records (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    car_id UUID REFERENCES cars(id) ON DELETE CASCADE NOT NULL,
    type VARCHAR(100) NOT NULL, -- oil_change, tire_rotation, brake_service, etc.
    date DATE NOT NULL,
    mileage INTEGER,
    notes TEXT,
    cost DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) NOT NULL
);

-- Suggested maintenance table
CREATE TABLE IF NOT EXISTS suggested_maintenance (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    car_id UUID REFERENCES cars(id) ON DELETE CASCADE NOT NULL,
    type VARCHAR(100) NOT NULL,
    due_date DATE,
    due_mileage INTEGER,
    status VARCHAR(20) CHECK (status IN ('pending', 'completed', 'overdue')) DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) NOT NULL
);

-- Media table for images, videos, PDFs, audio
CREATE TABLE IF NOT EXISTS media (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    car_id UUID REFERENCES cars(id) ON DELETE CASCADE NOT NULL,
    checklist_item_id UUID REFERENCES checklist_items(id) ON DELETE CASCADE,
    maintenance_record_id UUID REFERENCES maintenance_records(id) ON DELETE CASCADE,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(100) NOT NULL, -- image/jpeg, video/mp4, application/pdf, audio/mpeg
    file_size INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) NOT NULL
);

-- Approvals table for buyer/seller signatures
CREATE TABLE IF NOT EXISTS approvals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    car_id UUID REFERENCES cars(id) ON DELETE CASCADE NOT NULL,
    type VARCHAR(20) CHECK (type IN ('buyer', 'seller')) NOT NULL,
    signature TEXT, -- base64 encoded signature
    comment TEXT,
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(car_id, type)
);

-- ===================================
-- SHARING AND COLLABORATION TABLES
-- ===================================

-- Shared checklists table (Public sharing functionality)
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

-- User invitations table (Invite users to collaborate)
CREATE TABLE IF NOT EXISTS user_invitations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    car_id UUID REFERENCES cars(id) ON DELETE CASCADE NOT NULL,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('owner', 'contributor', 'viewer', 'holder', 'buyer', 'inspector', 'mechanic', 'other')) NOT NULL,
    invitation_token VARCHAR(100) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
    invited_by UUID REFERENCES auth.users(id) NOT NULL,
    accepted_at TIMESTAMP WITH TIME ZONE,
    accepted_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(car_id, email)
);

-- ===================================
-- FEEDBACK AND SUPPORT TABLES
-- ===================================

-- Feedback table
CREATE TABLE IF NOT EXISTS feedback (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    message TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    user_email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email signups table (Newsletter/updates)
CREATE TABLE IF NOT EXISTS email_signups (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================
-- INDEXES FOR PERFORMANCE
-- ===================================

-- Core table indexes
CREATE INDEX IF NOT EXISTS idx_cars_registration ON cars(registration_number);
CREATE INDEX IF NOT EXISTS idx_cars_created_by ON cars(created_by);
CREATE INDEX IF NOT EXISTS idx_cars_mileage ON cars(mileage) WHERE mileage IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_car_permissions_car_id ON car_permissions(car_id);
CREATE INDEX IF NOT EXISTS idx_car_permissions_user_id ON car_permissions(user_id);

CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

CREATE INDEX IF NOT EXISTS idx_checklist_items_car_id ON checklist_items(car_id);
CREATE INDEX IF NOT EXISTS idx_checklist_items_section ON checklist_items(section);

CREATE INDEX IF NOT EXISTS idx_maintenance_records_car_id ON maintenance_records(car_id);
CREATE INDEX IF NOT EXISTS idx_suggested_maintenance_car_id ON suggested_maintenance(car_id);

CREATE INDEX IF NOT EXISTS idx_media_car_id ON media(car_id);
CREATE INDEX IF NOT EXISTS idx_media_checklist_item_id ON media(checklist_item_id);
CREATE INDEX IF NOT EXISTS idx_media_maintenance_record_id ON media(maintenance_record_id);

CREATE INDEX IF NOT EXISTS idx_approvals_car_id ON approvals(car_id);

-- Sharing and collaboration indexes
CREATE INDEX IF NOT EXISTS idx_shared_checklists_token ON shared_checklists(share_token);
CREATE INDEX IF NOT EXISTS idx_shared_checklists_car_id ON shared_checklists(car_id);

CREATE INDEX IF NOT EXISTS idx_user_invitations_token ON user_invitations(invitation_token);
CREATE INDEX IF NOT EXISTS idx_user_invitations_car_id ON user_invitations(car_id);
CREATE INDEX IF NOT EXISTS idx_user_invitations_email ON user_invitations(email);

-- Support table indexes
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at);
CREATE INDEX IF NOT EXISTS idx_email_signups_email ON email_signups(email);

-- ===================================
-- ENABLE ROW LEVEL SECURITY
-- ===================================

ALTER TABLE cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE suggested_maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_signups ENABLE ROW LEVEL SECURITY;

-- ===================================
-- ROW LEVEL SECURITY POLICIES
-- ===================================

-- RLS Policies for cars table
DROP POLICY IF EXISTS "Users can view cars they have permission for" ON cars;
CREATE POLICY "Users can view cars they have permission for" ON cars
    FOR SELECT USING (
        id IN (
            SELECT car_id FROM car_permissions 
            WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Car owners can update their cars" ON cars;
CREATE POLICY "Car owners can update their cars" ON cars
    FOR UPDATE USING (
        id IN (
            SELECT car_id FROM car_permissions 
            WHERE user_id = auth.uid() AND role = 'owner'
        )
    );

DROP POLICY IF EXISTS "Authenticated users can create cars" ON cars;
CREATE POLICY "Authenticated users can create cars" ON cars
    FOR INSERT WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Car owners can delete their cars" ON cars;
CREATE POLICY "Car owners can delete their cars" ON cars
    FOR DELETE USING (
        id IN (
            SELECT car_id FROM car_permissions 
            WHERE user_id = auth.uid() AND role = 'owner'
        )
    );

-- RLS Policies for car_permissions table
DROP POLICY IF EXISTS "Users can view permissions for their cars" ON car_permissions;
CREATE POLICY "Users can view permissions for their cars" ON car_permissions
    FOR SELECT USING (
        car_id IN (
            SELECT car_id FROM car_permissions 
            WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Car owners can manage permissions" ON car_permissions;
CREATE POLICY "Car owners can manage permissions" ON car_permissions
    FOR ALL USING (
        car_id IN (
            SELECT car_id FROM car_permissions 
            WHERE user_id = auth.uid() AND role = 'owner'
        )
    );

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

-- RLS Policies for checklist_items table
DROP POLICY IF EXISTS "Users can view checklist items for cars they have access to" ON checklist_items;
CREATE POLICY "Users can view checklist items for cars they have access to" ON checklist_items
    FOR SELECT USING (
        car_id IN (
            SELECT car_id FROM car_permissions 
            WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Contributors and owners can modify checklist items" ON checklist_items;
CREATE POLICY "Contributors and owners can modify checklist items" ON checklist_items
    FOR ALL USING (
        car_id IN (
            SELECT car_id FROM car_permissions 
            WHERE user_id = auth.uid() AND role IN ('owner', 'contributor')
        )
    );

-- RLS Policies for maintenance_records table
DROP POLICY IF EXISTS "Users can view maintenance records for cars they have access to" ON maintenance_records;
CREATE POLICY "Users can view maintenance records for cars they have access to" ON maintenance_records
    FOR SELECT USING (
        car_id IN (
            SELECT car_id FROM car_permissions 
            WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Contributors and owners can modify maintenance records" ON maintenance_records;
CREATE POLICY "Contributors and owners can modify maintenance records" ON maintenance_records
    FOR ALL USING (
        car_id IN (
            SELECT car_id FROM car_permissions 
            WHERE user_id = auth.uid() AND role IN ('owner', 'contributor')
        )
    );

-- RLS Policies for suggested_maintenance table
DROP POLICY IF EXISTS "Users can view suggested maintenance for cars they have access to" ON suggested_maintenance;
CREATE POLICY "Users can view suggested maintenance for cars they have access to" ON suggested_maintenance
    FOR SELECT USING (
        car_id IN (
            SELECT car_id FROM car_permissions 
            WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Contributors and owners can modify suggested maintenance" ON suggested_maintenance;
CREATE POLICY "Contributors and owners can modify suggested maintenance" ON suggested_maintenance
    FOR ALL USING (
        car_id IN (
            SELECT car_id FROM car_permissions 
            WHERE user_id = auth.uid() AND role IN ('owner', 'contributor')
        )
    );

-- RLS Policies for media table
DROP POLICY IF EXISTS "Users can view media for cars they have access to" ON media;
CREATE POLICY "Users can view media for cars they have access to" ON media
    FOR SELECT USING (
        car_id IN (
            SELECT car_id FROM car_permissions 
            WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Contributors and owners can manage media" ON media;
CREATE POLICY "Contributors and owners can manage media" ON media
    FOR ALL USING (
        car_id IN (
            SELECT car_id FROM car_permissions 
            WHERE user_id = auth.uid() AND role IN ('owner', 'contributor')
        )
    );

-- RLS Policies for approvals table
DROP POLICY IF EXISTS "Users can view approvals for cars they have access to" ON approvals;
CREATE POLICY "Users can view approvals for cars they have access to" ON approvals
    FOR SELECT USING (
        car_id IN (
            SELECT car_id FROM car_permissions 
            WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Contributors and owners can manage approvals" ON approvals;
CREATE POLICY "Contributors and owners can manage approvals" ON approvals
    FOR ALL USING (
        car_id IN (
            SELECT car_id FROM car_permissions 
            WHERE user_id = auth.uid() AND role IN ('owner', 'contributor')
        )
    );

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

-- RLS Policies for feedback
DROP POLICY IF EXISTS "Anyone can submit feedback" ON feedback;
CREATE POLICY "Anyone can submit feedback" ON feedback
    FOR INSERT WITH CHECK (true);

-- RLS Policies for email signups
DROP POLICY IF EXISTS "Anyone can signup for email" ON email_signups;
CREATE POLICY "Anyone can signup for email" ON email_signups
    FOR INSERT WITH CHECK (true);

-- ===================================
-- DATABASE FUNCTIONS AND TRIGGERS
-- ===================================

-- Function to automatically create car permission when a car is created
CREATE OR REPLACE FUNCTION create_car_owner_permission()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO car_permissions (car_id, user_id, role)
    VALUES (NEW.id, NEW.created_by, 'owner');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create owner permission
DROP TRIGGER IF EXISTS create_car_owner_permission_trigger ON cars;
CREATE TRIGGER create_car_owner_permission_trigger
    AFTER INSERT ON cars
    FOR EACH ROW
    EXECUTE FUNCTION create_car_owner_permission();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_cars_updated_at ON cars;
CREATE TRIGGER update_cars_updated_at BEFORE UPDATE ON cars
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_checklist_items_updated_at ON checklist_items;
CREATE TRIGGER update_checklist_items_updated_at BEFORE UPDATE ON checklist_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===================================
-- COMMENTS FOR DOCUMENTATION
-- ===================================

COMMENT ON TABLE cars IS 'Main cars table storing vehicle information';
COMMENT ON COLUMN cars.mileage IS 'Odometer reading in kilometers at the time of registration/last update';
COMMENT ON COLUMN car_permissions.role IS 'User role for the car: owner (omistaja), contributor (toimittaja), viewer (lukija), holder (haltija/käyttäjä), buyer (mahdollinen ostaja), inspector (kuntotarkastaja), mechanic (korjaaja), other (muu)';
COMMENT ON TABLE user_profiles IS 'Extended user profile information beyond Supabase auth.users';
COMMENT ON TABLE shared_checklists IS 'Public sharing functionality for car checklists';
COMMENT ON TABLE user_invitations IS 'System for inviting users to collaborate on car data';