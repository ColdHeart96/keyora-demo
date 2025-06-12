-- Create tables for the real estate ERP

-- Agents table (synchronized with Clerk users)
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_id TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Properties table
CREATE TABLE properties (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(12,2) NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  postal_code TEXT,
  type TEXT NOT NULL,
  status TEXT DEFAULT 'available',
  surface DECIMAL(10,2),
  bedrooms INTEGER,
  bathrooms INTEGER,
  features TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Clients table
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  notes TEXT
);

-- Prospects table
CREATE TABLE prospects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  budget_min DECIMAL(12,2),
  budget_max DECIMAL(12,2),
  preferred_locations TEXT[],
  property_type TEXT[],
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'converted')),
  notes TEXT
);

-- Visits table
CREATE TABLE visits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  notes TEXT
);

-- Documents table
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  url TEXT NOT NULL,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE
);

-- Activities table for analytics
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  details JSONB
);

-- Create indexes for better performance
CREATE INDEX idx_properties_agent_id ON properties(agent_id);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_clients_agent_id ON clients(agent_id);
CREATE INDEX idx_prospects_agent_id ON prospects(agent_id);
CREATE INDEX idx_visits_agent_id ON visits(agent_id);
CREATE INDEX idx_visits_property_id ON visits(property_id);
CREATE INDEX idx_visits_client_id ON visits(client_id);
CREATE INDEX idx_documents_property_id ON documents(property_id);
CREATE INDEX idx_activities_agent_id ON activities(agent_id);
CREATE INDEX idx_activities_created_at ON activities(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Agents can view their own data" ON agents
  FOR SELECT
  USING (clerk_id = auth.uid());

CREATE POLICY "Agents can view their properties" ON properties
  FOR ALL
  USING (agent_id = (SELECT id FROM agents WHERE clerk_id = auth.uid()));

CREATE POLICY "Agents can view their clients" ON clients
  FOR ALL
  USING (agent_id = (SELECT id FROM agents WHERE clerk_id = auth.uid()));

CREATE POLICY "Agents can view their prospects" ON prospects
  FOR ALL
  USING (agent_id = (SELECT id FROM agents WHERE clerk_id = auth.uid()));

CREATE POLICY "Agents can view their visits" ON visits
  FOR ALL
  USING (agent_id = (SELECT id FROM agents WHERE clerk_id = auth.uid()));

CREATE POLICY "Agents can view their documents" ON documents
  FOR ALL
  USING (agent_id = (SELECT id FROM agents WHERE clerk_id = auth.uid()));

CREATE POLICY "Agents can view their activities" ON activities
  FOR ALL
  USING (agent_id = (SELECT id FROM agents WHERE clerk_id = auth.uid()));

-- Add RLS policies
CREATE POLICY "Users can view their own properties"
  ON properties FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own properties"
  ON properties FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own properties"
  ON properties FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own properties"
  ON properties FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX properties_user_id_idx ON properties(user_id);
CREATE INDEX properties_type_idx ON properties(type);
CREATE INDEX properties_status_idx ON properties(status);
CREATE INDEX properties_city_idx ON properties(city);
CREATE INDEX properties_price_idx ON properties(price);

-- Add triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_properties_updated_at
    BEFORE UPDATE ON properties
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 