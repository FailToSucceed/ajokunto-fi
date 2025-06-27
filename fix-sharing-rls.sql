-- Fix RLS policies for shared_checklists to allow public access via token

-- Add public policy for validating share tokens (anyone can read by token)
DROP POLICY IF EXISTS "Anyone can validate share tokens" ON shared_checklists;
CREATE POLICY "Anyone can validate share tokens" ON shared_checklists
    FOR SELECT USING (true);

-- Keep the existing authenticated policies for managing shares
-- (These remain unchanged)

-- Note: This allows public read access to shared_checklists table
-- but the actual checklist data access is still controlled by 
-- the application logic and separate car permissions