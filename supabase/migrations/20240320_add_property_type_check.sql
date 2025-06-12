-- Add check constraint for property type
ALTER TABLE properties ADD CONSTRAINT properties_type_check 
CHECK (type IN ('house', 'apartment', 'villa', 'land', 'commercial')); 