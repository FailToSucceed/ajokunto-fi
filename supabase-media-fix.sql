-- Fix media table RLS policy to work with simplified car policies
-- Run this in your Supabase SQL Editor after running supabase-nuclear-fix.sql

-- Step 1: Drop existing media policies
DROP POLICY IF EXISTS "Contributors and owners can manage media" ON media;

-- Step 2: Create simplified media policies that work with the simplified car policies
CREATE POLICY "media_select_policy" ON media
    FOR SELECT USING (
        -- User owns the car directly
        EXISTS (SELECT 1 FROM cars WHERE id = media.car_id AND created_by = auth.uid())
        OR
        -- User has permissions for the car
        EXISTS (SELECT 1 FROM car_permissions WHERE car_id = media.car_id AND user_id = auth.uid())
    );

CREATE POLICY "media_insert_policy" ON media
    FOR INSERT WITH CHECK (
        -- User owns the car directly
        EXISTS (SELECT 1 FROM cars WHERE id = media.car_id AND created_by = auth.uid())
        OR
        -- User has contributor/owner permissions for the car
        EXISTS (
            SELECT 1 FROM car_permissions 
            WHERE car_id = media.car_id 
            AND user_id = auth.uid() 
            AND role IN ('owner', 'contributor')
        )
    );

CREATE POLICY "media_update_policy" ON media
    FOR UPDATE USING (
        -- User owns the car directly
        EXISTS (SELECT 1 FROM cars WHERE id = media.car_id AND created_by = auth.uid())
        OR
        -- User has contributor/owner permissions for the car
        EXISTS (
            SELECT 1 FROM car_permissions 
            WHERE car_id = media.car_id 
            AND user_id = auth.uid() 
            AND role IN ('owner', 'contributor')
        )
    );

CREATE POLICY "media_delete_policy" ON media
    FOR DELETE USING (
        -- User owns the car directly
        EXISTS (SELECT 1 FROM cars WHERE id = media.car_id AND created_by = auth.uid())
        OR
        -- User has contributor/owner permissions for the car
        EXISTS (
            SELECT 1 FROM car_permissions 
            WHERE car_id = media.car_id 
            AND user_id = auth.uid() 
            AND role IN ('owner', 'contributor')
        )
    );