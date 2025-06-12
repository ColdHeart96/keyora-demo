-- Drop the existing constraint
ALTER TABLE properties DROP CONSTRAINT IF EXISTS properties_type_check;

-- Add the new constraint with our exact values
ALTER TABLE properties ADD CONSTRAINT properties_type_check 
CHECK (type IN ('house', 'apartment', 'villa', 'land', 'commercial')); 