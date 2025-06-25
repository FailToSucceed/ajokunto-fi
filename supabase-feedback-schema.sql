-- Additional tables for feedback and email signups

-- Feedback table
CREATE TABLE feedback (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    message TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    user_email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email signups table
CREATE TABLE email_signups (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shared checklists table for sharing functionality
CREATE TABLE shared_checklists (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    car_id UUID REFERENCES cars(id) ON DELETE CASCADE NOT NULL,
    share_token VARCHAR(100) NOT NULL UNIQUE,
    permission_type VARCHAR(20) CHECK (permission_type IN ('view', 'edit')) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    accessed_count INTEGER DEFAULT 0
);

-- Create indexes
CREATE INDEX idx_feedback_created_at ON feedback(created_at);
CREATE INDEX idx_email_signups_email ON email_signups(email);
CREATE INDEX idx_shared_checklists_token ON shared_checklists(share_token);
CREATE INDEX idx_shared_checklists_car_id ON shared_checklists(car_id);

-- Enable RLS
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_signups ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_checklists ENABLE ROW LEVEL SECURITY;

-- RLS Policies for feedback (anyone can insert, only admins can view)
CREATE POLICY "Anyone can submit feedback" ON feedback
    FOR INSERT WITH CHECK (true);

-- RLS Policies for email signups (anyone can insert, only admins can view)
CREATE POLICY "Anyone can signup for email" ON email_signups
    FOR INSERT WITH CHECK (true);

-- RLS Policies for shared checklists
CREATE POLICY "Car owners and contributors can create shares" ON shared_checklists
    FOR INSERT WITH CHECK (
        car_id IN (
            SELECT car_id FROM car_permissions 
            WHERE user_id = auth.uid() AND role IN ('owner', 'contributor')
        )
    );

CREATE POLICY "Car owners and contributors can view their shares" ON shared_checklists
    FOR SELECT USING (
        car_id IN (
            SELECT car_id FROM car_permissions 
            WHERE user_id = auth.uid() AND role IN ('owner', 'contributor')
        )
    );

CREATE POLICY "Car owners and contributors can update their shares" ON shared_checklists
    FOR UPDATE USING (
        car_id IN (
            SELECT car_id FROM car_permissions 
            WHERE user_id = auth.uid() AND role IN ('owner', 'contributor')
        )
    );

CREATE POLICY "Car owners and contributors can delete their shares" ON shared_checklists
    FOR DELETE USING (
        car_id IN (
            SELECT car_id FROM car_permissions 
            WHERE user_id = auth.uid() AND role IN ('owner', 'contributor')
        )
    );