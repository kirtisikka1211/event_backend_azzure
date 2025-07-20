-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  time TIME NOT NULL,
  location VARCHAR(255) NOT NULL,
  max_attendees INTEGER DEFAULT 50,
  current_attendees INTEGER DEFAULT 0,
  bank_details JSONB DEFAULT NULL,
  image_url VARCHAR(500),
  meet_link VARCHAR(500),
  requires_checkin BOOLEAN DEFAULT true,
  registration_fields JSONB DEFAULT '[]',
  created_by UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  registration_fee NUMERIC(10, 2) DEFAULT NULL,
  -- Add a check constraint to validate bank_details structure
  CONSTRAINT valid_bank_details CHECK (
    bank_details IS NULL OR (
      bank_details ? 'account_holder' AND
      bank_details ? 'account_number' AND
      bank_details ? 'ifsc_code' AND
      bank_details ? 'bank_name' AND
        bank_details ? 'upi_id' AND


    )
  )
);

-- Create registrations table
CREATE TABLE IF NOT EXISTS registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  registration_data JSONB DEFAULT '{}',
  status VARCHAR(50) DEFAULT 'registered',
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  checked_in_at TIMESTAMP WITH TIME ZONE,
  last_modified_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(event_id, user_id)
);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON events(created_by);
CREATE INDEX IF NOT EXISTS idx_registrations_event_id ON registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_user_id ON registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON registrations(status);

-- Add comment to document bank_details structure
COMMENT ON COLUMN events.bank_details IS 'JSON structure: {
  "account_holder": "string",
  "account_number": "string",
  "ifsc_code": "string",
  "bank_name": "string",
  "qr_code_url": "string (optional)"
}';

-- Function to migrate existing data (if needed)
CREATE OR REPLACE FUNCTION migrate_bank_details()
RETURNS void AS $$
BEGIN
  -- Convert any existing text bank_details to JSONB format
  UPDATE events
  SET bank_details = NULL
  WHERE bank_details IS NOT NULL AND jsonb_typeof(bank_details::jsonb) IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Run migration function
SELECT migrate_bank_details();

-- Create RLS policies
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Policy for viewing events
CREATE POLICY "View events" ON events
  FOR SELECT
  USING (
    (role = 'admin' AND created_by = auth.uid()) OR
    (role = 'user' AND date >= CURRENT_DATE)
  );

-- Policy for creating events
CREATE POLICY "Create events" ON events
  FOR INSERT
  WITH CHECK (role = 'admin');

-- Policy for updating events
CREATE POLICY "Update events" ON events
  FOR UPDATE
  USING (role = 'admin' AND created_by = auth.uid());

-- Policy for deleting events
CREATE POLICY "Delete events" ON events
  FOR DELETE
  USING (role = 'admin' AND created_by = auth.uid());

-- First, remove the registration_fee column
ALTER TABLE events 
DROP COLUMN IF EXISTS registration_fee;

-- First, make sure bank_details allows NULL
ALTER TABLE events 
ALTER COLUMN bank_details DROP NOT NULL;

-- Then convert to JSONB
ALTER TABLE events 
ALTER COLUMN bank_details TYPE JSONB USING 
  CASE 
    WHEN bank_details IS NULL THEN NULL
    ELSE jsonb_build_object(
      'account_holder', '',
      'account_number', '',
      'ifsc_code', '',
      'bank_name', '',
      'qr_code_url', NULL
    )
  END;

-- Add constraint to validate bank_details structure
ALTER TABLE events
ADD CONSTRAINT valid_bank_details CHECK (
  bank_details IS NULL OR (
    bank_details ? 'account_holder' AND
    bank_details ? 'account_number' AND
    bank_details ? 'ifsc_code' AND
    bank_details ? 'bank_name'
  )
);

-- Add helpful indexes
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON events(created_by);
CREATE INDEX IF NOT EXISTS idx_registrations_event_id ON registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_user_id ON registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON registrations(status);

-- Function to migrate any existing bank details data
CREATE OR REPLACE FUNCTION migrate_bank_details()
RETURNS void AS $$
BEGIN
  -- Convert any existing text bank_details to JSONB format
  UPDATE events
  SET bank_details = NULL
  WHERE bank_details IS NOT NULL AND jsonb_typeof(bank_details::jsonb) IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Run the migration
SELECT migrate_bank_details();

-- Add registration_fee column to events table
ALTER TABLE events
ADD COLUMN IF NOT EXISTS registration_fee NUMERIC(10, 2) DEFAULT NULL;

-- Add index for registration_fee
CREATE INDEX IF NOT EXISTS idx_events_registration_fee ON events(registration_fee);

-- Run the migration
SELECT migrate_bank_details(); 