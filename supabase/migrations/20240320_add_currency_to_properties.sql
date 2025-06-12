-- Add currency column to properties table
ALTER TABLE properties ADD COLUMN currency TEXT DEFAULT 'EUR' NOT NULL;

-- Update existing rows to have EUR as currency
UPDATE properties SET currency = 'EUR' WHERE currency IS NULL; 