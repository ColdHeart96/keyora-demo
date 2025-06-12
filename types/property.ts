export interface Property {
  id: string;
  title: string;
  description?: string;
  price?: number;
  currency?: string;
  surface?: number;
  rooms?: number;
  bedrooms?: number;
  bathrooms?: number;
  type: 'house' | 'apartment' | 'land' | 'commercial' | 'other';
  status: 'available' | 'under_contract' | 'sold' | 'rented';
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  features?: string[];
  images?: string[];
  user_id: string;
  created_at: string;
  updated_at: string;
} 