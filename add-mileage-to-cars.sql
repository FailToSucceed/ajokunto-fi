-- Add mileage field to cars table
-- This allows storing the odometer reading for each car

-- Add mileage column to cars table
ALTER TABLE cars 
ADD COLUMN IF NOT EXISTS mileage INTEGER;

-- Add comment to describe the column
COMMENT ON COLUMN cars.mileage IS 'Odometer reading in kilometers at the time of registration/last update';

-- Create index for better performance when querying by mileage
CREATE INDEX IF NOT EXISTS idx_cars_mileage ON cars(mileage) WHERE mileage IS NOT NULL;