-- Update car_permissions table to support additional role types
-- This adds support for: holder, buyer, inspector, mechanic, other

-- First, drop the existing constraint
ALTER TABLE car_permissions 
DROP CONSTRAINT IF EXISTS car_permissions_role_check;

-- Add the new constraint with all role types
ALTER TABLE car_permissions 
ADD CONSTRAINT car_permissions_role_check 
CHECK (role IN ('owner', 'contributor', 'viewer', 'holder', 'buyer', 'inspector', 'mechanic', 'other'));

-- Update the comment to reflect the new roles
COMMENT ON COLUMN car_permissions.role IS 'User role for the car: owner (omistaja), contributor (toimittaja), viewer (lukija), holder (haltija/käyttäjä), buyer (mahdollinen ostaja), inspector (kuntotarkastaja), mechanic (korjaaja), other (muu)';