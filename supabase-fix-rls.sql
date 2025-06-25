-- Fix infinite recursion in car_permissions RLS policy
-- Run this in your Supabase SQL Editor

-- Drop the problematic policies
DROP POLICY IF EXISTS "Users can view permissions for their cars" ON car_permissions;
DROP POLICY IF EXISTS "Car owners can manage permissions" ON car_permissions;

-- Create corrected RLS policies for car_permissions
CREATE POLICY "Users can view their own permissions" ON car_permissions
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Car owners can view all permissions for their cars" ON car_permissions
    FOR SELECT USING (
        car_id IN (
            SELECT id FROM cars WHERE created_by = auth.uid()
        )
    );

CREATE POLICY "Car owners can insert permissions" ON car_permissions
    FOR INSERT WITH CHECK (
        car_id IN (
            SELECT id FROM cars WHERE created_by = auth.uid()
        )
    );

CREATE POLICY "Car owners can update permissions" ON car_permissions
    FOR UPDATE USING (
        car_id IN (
            SELECT id FROM cars WHERE created_by = auth.uid()
        )
    );

CREATE POLICY "Car owners can delete permissions" ON car_permissions
    FOR DELETE USING (
        car_id IN (
            SELECT id FROM cars WHERE created_by = auth.uid()
        )
    );

-- Also fix the cars table policies to avoid recursion
DROP POLICY IF EXISTS "Users can view cars they have permission for" ON cars;

CREATE POLICY "Users can view cars they have permission for" ON cars
    FOR SELECT USING (
        auth.uid() = created_by OR
        id IN (
            SELECT cp.car_id FROM car_permissions cp WHERE cp.user_id = auth.uid()
        )
    );