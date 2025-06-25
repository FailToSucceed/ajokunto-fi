-- Fix infinite recursion in cars RLS policy
-- Run this in your Supabase SQL Editor

-- Drop all existing policies on cars table
DROP POLICY IF EXISTS "Users can view cars they have permission for" ON cars;
DROP POLICY IF EXISTS "Car owners can update their cars" ON cars;
DROP POLICY IF EXISTS "Authenticated users can create cars" ON cars;
DROP POLICY IF EXISTS "Car owners can delete their cars" ON cars;

-- Create simple, non-recursive policies for cars table
CREATE POLICY "Users can view cars they own" ON cars
    FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Users can view cars they have permissions for" ON cars
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM car_permissions cp 
            WHERE cp.car_id = cars.id 
            AND cp.user_id = auth.uid()
        )
    );

CREATE POLICY "Car owners can update their own cars" ON cars
    FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Authenticated users can create cars" ON cars
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Car owners can delete their own cars" ON cars
    FOR DELETE USING (created_by = auth.uid());

-- Also ensure car_permissions policies are clean
DROP POLICY IF EXISTS "Users can view their own permissions" ON car_permissions;
DROP POLICY IF EXISTS "Car owners can view all permissions for their cars" ON car_permissions;
DROP POLICY IF EXISTS "Car owners can insert permissions" ON car_permissions;
DROP POLICY IF EXISTS "Car owners can update permissions" ON car_permissions;
DROP POLICY IF EXISTS "Car owners can delete permissions" ON car_permissions;

-- Simple car_permissions policies that don't reference cars table
CREATE POLICY "Users can view their own permissions" ON car_permissions
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage permissions for cars they created" ON car_permissions
    FOR ALL USING (
        car_id IN (
            SELECT id FROM cars WHERE created_by = auth.uid()
        )
    );

-- Alternative: If above still causes issues, use this simpler approach
-- Comment out the above and uncomment below if needed:

/*
-- Super simple approach - just check ownership directly
DROP POLICY IF EXISTS "Users can manage permissions for cars they created" ON car_permissions;

CREATE POLICY "Car creators can manage all permissions" ON car_permissions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM cars c 
            WHERE c.id = car_permissions.car_id 
            AND c.created_by = auth.uid()
        )
    );
*/