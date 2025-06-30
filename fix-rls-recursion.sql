-- Fix infinite recursion in car_permissions RLS policies
-- This issue occurs when policies reference each other in a circular manner

-- First, disable RLS temporarily on car_permissions to break the cycle
ALTER TABLE car_permissions DISABLE ROW LEVEL SECURITY;

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view permissions for their cars" ON car_permissions;
DROP POLICY IF EXISTS "Car owners can manage permissions" ON car_permissions;

-- Re-enable RLS
ALTER TABLE car_permissions ENABLE ROW LEVEL SECURITY;

-- Create simpler, non-recursive policies for car_permissions
CREATE POLICY "Users can view their own permissions" ON car_permissions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view permissions for cars they own" ON car_permissions
    FOR SELECT USING (
        car_id IN (
            SELECT cp.car_id FROM car_permissions cp 
            WHERE cp.user_id = auth.uid() AND cp.role = 'owner'
        )
    );

CREATE POLICY "Car owners can insert permissions" ON car_permissions
    FOR INSERT WITH CHECK (
        car_id IN (
            SELECT cp.car_id FROM car_permissions cp 
            WHERE cp.user_id = auth.uid() AND cp.role = 'owner'
        )
    );

CREATE POLICY "Car owners can update permissions" ON car_permissions
    FOR UPDATE USING (
        car_id IN (
            SELECT cp.car_id FROM car_permissions cp 
            WHERE cp.user_id = auth.uid() AND cp.role = 'owner'
        )
    );

CREATE POLICY "Car owners can delete permissions" ON car_permissions
    FOR DELETE USING (
        car_id IN (
            SELECT cp.car_id FROM car_permissions cp 
            WHERE cp.user_id = auth.uid() AND cp.role = 'owner'
        )
    );

-- Alternative: Create a function to avoid recursion
CREATE OR REPLACE FUNCTION is_car_owner(car_id_param uuid, user_id_param uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM car_permissions 
        WHERE car_id = car_id_param 
        AND user_id = user_id_param 
        AND role = 'owner'
    );
$$;

-- Drop the problematic policies and recreate with function
DROP POLICY IF EXISTS "Users can view their own permissions" ON car_permissions;
DROP POLICY IF EXISTS "Users can view permissions for cars they own" ON car_permissions;
DROP POLICY IF EXISTS "Car owners can insert permissions" ON car_permissions;
DROP POLICY IF EXISTS "Car owners can update permissions" ON car_permissions;
DROP POLICY IF EXISTS "Car owners can delete permissions" ON car_permissions;

-- Create clean policies using the function
CREATE POLICY "Users can view own permissions" ON car_permissions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Car owners can manage all permissions" ON car_permissions
    FOR ALL USING (is_car_owner(car_id, auth.uid()));

-- Also fix cars table policies to avoid recursion
DROP POLICY IF EXISTS "Users can view cars they have permission for" ON cars;
CREATE POLICY "Users can view cars they have permission for" ON cars
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM car_permissions cp 
            WHERE cp.car_id = cars.id 
            AND cp.user_id = auth.uid()
        )
    );