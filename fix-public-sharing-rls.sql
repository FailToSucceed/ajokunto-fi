-- Enable public read access for car sharing
-- This allows anonymous users to view shared car inspection data

-- Add public read policy for cars table (for shared car info)
DROP POLICY IF EXISTS "Allow public read access for cars" ON cars;
CREATE POLICY "Allow public read access for cars" ON cars
    FOR SELECT USING (true);

-- Add public read policy for checklist_items table (for shared inspection data)
DROP POLICY IF EXISTS "Allow public read access for checklist_items" ON checklist_items;
CREATE POLICY "Allow public read access for checklist_items" ON checklist_items
    FOR SELECT USING (true);

-- Add public read policy for media table (for shared images)
DROP POLICY IF EXISTS "Allow public read access for media" ON media;
CREATE POLICY "Allow public read access for media" ON media
    FOR SELECT USING (true);

-- Note: These policies enable public read access to all car data
-- In production, you might want to restrict this to only cars that have active shares
-- or add additional checks based on the application's requirements