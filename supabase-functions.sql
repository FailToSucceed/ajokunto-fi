-- Function to get user by email (for adding permissions)
-- This function should be created in Supabase SQL editor

CREATE OR REPLACE FUNCTION get_user_by_email(user_email text)
RETURNS TABLE(id uuid, email text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.email
  FROM auth.users u
  WHERE u.email = user_email
  AND u.email_confirmed_at IS NOT NULL;
END;
$$;

-- Function to get car permissions with user emails
CREATE OR REPLACE FUNCTION get_car_permissions_with_users(car_id_param uuid)
RETURNS TABLE(
  id uuid,
  car_id uuid,
  user_id uuid,
  role text,
  user_email text,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cp.id,
    cp.car_id,
    cp.user_id,
    cp.role,
    u.email,
    cp.created_at
  FROM car_permissions cp
  JOIN auth.users u ON cp.user_id = u.id
  WHERE cp.car_id = car_id_param;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_user_by_email TO authenticated;
GRANT EXECUTE ON FUNCTION get_car_permissions_with_users TO authenticated;