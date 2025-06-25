-- Nuclear fix for RLS infinite recursion
-- Run this in your Supabase SQL Editor

-- Step 1: Disable RLS and drop all problematic policies
ALTER TABLE cars DISABLE ROW LEVEL SECURITY;
ALTER TABLE car_permissions DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view cars they own" ON cars;
DROP POLICY IF EXISTS "Users can view cars they have permissions for" ON cars;
DROP POLICY IF EXISTS "Car owners can update their own cars" ON cars;
DROP POLICY IF EXISTS "Authenticated users can create cars" ON cars;
DROP POLICY IF EXISTS "Car owners can delete their own cars" ON cars;
DROP POLICY IF EXISTS "Users can view their own permissions" ON car_permissions;
DROP POLICY IF EXISTS "Users can manage permissions for cars they created" ON car_permissions;

-- Step 2: Re-enable RLS
ALTER TABLE cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_permissions ENABLE ROW LEVEL SECURITY;

-- Step 3: Create the simplest possible policies
-- Cars table - only check direct ownership
CREATE POLICY "cars_select_policy" ON cars
    FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "cars_insert_policy" ON cars
    FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "cars_update_policy" ON cars
    FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "cars_delete_policy" ON cars
    FOR DELETE USING (created_by = auth.uid());

-- Car permissions table - simple policies
CREATE POLICY "car_permissions_select_policy" ON car_permissions
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "car_permissions_insert_policy" ON car_permissions
    FOR INSERT WITH CHECK (
        user_id = auth.uid() OR 
        EXISTS (SELECT 1 FROM cars WHERE id = car_permissions.car_id AND created_by = auth.uid())
    );

CREATE POLICY "car_permissions_update_policy" ON car_permissions
    FOR UPDATE USING (
        user_id = auth.uid() OR 
        EXISTS (SELECT 1 FROM cars WHERE id = car_permissions.car_id AND created_by = auth.uid())
    );

CREATE POLICY "car_permissions_delete_policy" ON car_permissions
    FOR DELETE USING (
        user_id = auth.uid() OR 
        EXISTS (SELECT 1 FROM cars WHERE id = car_permissions.car_id AND created_by = auth.uid())
    );