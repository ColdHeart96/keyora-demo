import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types pour les tables principales
export type Property = {
  id: string;
  created_at: string;
  title: string;
  description: string;
  price: number;
  address: string;
  type: string;
  status: 'available' | 'pending' | 'sold';
  agent_id: string;
};

export type Client = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string;
  agent_id: string;
};

export type Prospect = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string;
  budget_min: number;
  budget_max: number;
  preferred_locations: string[];
  property_type: string[];
  agent_id: string;
};

export type Visit = {
  id: string;
  created_at: string;
  property_id: string;
  client_id: string;
  agent_id: string;
  date: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes: string;
}; 