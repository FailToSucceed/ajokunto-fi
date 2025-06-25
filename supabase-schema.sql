-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

-- Cars table
CREATE TABLE cars (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    registration_number VARCHAR(20) NOT NULL UNIQUE,
    make VARCHAR(100),
    model VARCHAR(100),
    year INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) NOT NULL
);

-- Car permissions table (roles: owner, contributor, viewer)
CREATE TABLE car_permissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    car_id UUID REFERENCES cars(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role VARCHAR(20) CHECK (role IN ('owner', 'contributor', 'viewer')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(car_id, user_id)
);

-- Checklist items table
CREATE TABLE checklist_items (
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
CREATE TABLE maintenance_records (
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
CREATE TABLE suggested_maintenance (
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
CREATE TABLE media (
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
CREATE TABLE approvals (
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

-- Create indexes for better performance
CREATE INDEX idx_cars_registration ON cars(registration_number);
CREATE INDEX idx_cars_created_by ON cars(created_by);
CREATE INDEX idx_car_permissions_car_id ON car_permissions(car_id);
CREATE INDEX idx_car_permissions_user_id ON car_permissions(user_id);
CREATE INDEX idx_checklist_items_car_id ON checklist_items(car_id);
CREATE INDEX idx_checklist_items_section ON checklist_items(section);
CREATE INDEX idx_maintenance_records_car_id ON maintenance_records(car_id);
CREATE INDEX idx_suggested_maintenance_car_id ON suggested_maintenance(car_id);
CREATE INDEX idx_media_car_id ON media(car_id);
CREATE INDEX idx_media_checklist_item_id ON media(checklist_item_id);
CREATE INDEX idx_media_maintenance_record_id ON media(maintenance_record_id);
CREATE INDEX idx_approvals_car_id ON approvals(car_id);

-- Enable Row Level Security
ALTER TABLE cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE suggested_maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for cars table
CREATE POLICY "Users can view cars they have permission for" ON cars
    FOR SELECT USING (
        id IN (
            SELECT car_id FROM car_permissions 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Car owners can update their cars" ON cars
    FOR UPDATE USING (
        id IN (
            SELECT car_id FROM car_permissions 
            WHERE user_id = auth.uid() AND role = 'owner'
        )
    );

CREATE POLICY "Authenticated users can create cars" ON cars
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Car owners can delete their cars" ON cars
    FOR DELETE USING (
        id IN (
            SELECT car_id FROM car_permissions 
            WHERE user_id = auth.uid() AND role = 'owner'
        )
    );

-- RLS Policies for car_permissions table
CREATE POLICY "Users can view permissions for their cars" ON car_permissions
    FOR SELECT USING (
        car_id IN (
            SELECT car_id FROM car_permissions 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Car owners can manage permissions" ON car_permissions
    FOR ALL USING (
        car_id IN (
            SELECT car_id FROM car_permissions 
            WHERE user_id = auth.uid() AND role = 'owner'
        )
    );

-- RLS Policies for checklist_items table
CREATE POLICY "Users can view checklist items for cars they have access to" ON checklist_items
    FOR SELECT USING (
        car_id IN (
            SELECT car_id FROM car_permissions 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Contributors and owners can modify checklist items" ON checklist_items
    FOR ALL USING (
        car_id IN (
            SELECT car_id FROM car_permissions 
            WHERE user_id = auth.uid() AND role IN ('owner', 'contributor')
        )
    );

-- RLS Policies for maintenance_records table
CREATE POLICY "Users can view maintenance records for cars they have access to" ON maintenance_records
    FOR SELECT USING (
        car_id IN (
            SELECT car_id FROM car_permissions 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Contributors and owners can modify maintenance records" ON maintenance_records
    FOR ALL USING (
        car_id IN (
            SELECT car_id FROM car_permissions 
            WHERE user_id = auth.uid() AND role IN ('owner', 'contributor')
        )
    );

-- RLS Policies for suggested_maintenance table
CREATE POLICY "Users can view suggested maintenance for cars they have access to" ON suggested_maintenance
    FOR SELECT USING (
        car_id IN (
            SELECT car_id FROM car_permissions 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Contributors and owners can modify suggested maintenance" ON suggested_maintenance
    FOR ALL USING (
        car_id IN (
            SELECT car_id FROM car_permissions 
            WHERE user_id = auth.uid() AND role IN ('owner', 'contributor')
        )
    );

-- RLS Policies for media table
CREATE POLICY "Users can view media for cars they have access to" ON media
    FOR SELECT USING (
        car_id IN (
            SELECT car_id FROM car_permissions 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Contributors and owners can manage media" ON media
    FOR ALL USING (
        car_id IN (
            SELECT car_id FROM car_permissions 
            WHERE user_id = auth.uid() AND role IN ('owner', 'contributor')
        )
    );

-- RLS Policies for approvals table
CREATE POLICY "Users can view approvals for cars they have access to" ON approvals
    FOR SELECT USING (
        car_id IN (
            SELECT car_id FROM car_permissions 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Contributors and owners can manage approvals" ON approvals
    FOR ALL USING (
        car_id IN (
            SELECT car_id FROM car_permissions 
            WHERE user_id = auth.uid() AND role IN ('owner', 'contributor')
        )
    );

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
CREATE TRIGGER update_cars_updated_at BEFORE UPDATE ON cars
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_checklist_items_updated_at BEFORE UPDATE ON checklist_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();