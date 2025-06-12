import { createClient } from '@supabase/supabase-js';
import { Property, CreatePropertyInput } from '@/types/property';

// Créer un client Supabase côté serveur
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const propertyService = {
  // Récupérer toutes les propriétés d'un utilisateur
  async getAllProperties(userId: string): Promise<Property[]> {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Récupérer une propriété par son ID
  async getPropertyById(propertyId: string): Promise<Property | null> {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .single();

    if (error) throw error;
    return data;
  },

  // Créer une nouvelle propriété
  async createProperty(property: CreatePropertyInput & { user_id: string }): Promise<Property> {
    console.log('Service - Tentative de création avec les données:', property);
    
    try {
      const { data, error } = await supabase
        .from('properties')
        .insert([{
          ...property,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('Service - Erreur Supabase:', error);
        throw new Error(`Erreur Supabase: ${error.message} (Code: ${error.code})`);
      }

      if (!data) {
        throw new Error('Aucune donnée retournée après la création');
      }

      console.log('Service - Propriété créée avec succès:', data);
      return data;
    } catch (error) {
      console.error('Service - Erreur lors de la création:', error);
      throw error;
    }
  },

  // Mettre à jour une propriété
  async updateProperty(property: Partial<Property> & { id: string }): Promise<Property> {
    const { data, error } = await supabase
      .from('properties')
      .update({
        ...property,
        updated_at: new Date().toISOString()
      })
      .eq('id', property.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Supprimer une propriété
  async deleteProperty(propertyId: string): Promise<void> {
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', propertyId);

    if (error) throw error;
  },

  // Rechercher des propriétés selon des critères
  async searchProperties(criteria: {
    minPrice?: number;
    maxPrice?: number;
    type?: Property['type'];
    city?: string;
    minRooms?: number;
    minBedrooms?: number;
    minSurface?: number;
    status?: Property['status'];
  }): Promise<Property[]> {
    let query = supabase
      .from('properties')
      .select('*');

    if (criteria.minPrice) {
      query = query.gte('price', criteria.minPrice);
    }
    if (criteria.maxPrice) {
      query = query.lte('price', criteria.maxPrice);
    }
    if (criteria.type) {
      query = query.eq('type', criteria.type);
    }
    if (criteria.city) {
      query = query.ilike('city', `%${criteria.city}%`);
    }
    if (criteria.minRooms) {
      query = query.gte('rooms', criteria.minRooms);
    }
    if (criteria.minBedrooms) {
      query = query.gte('bedrooms', criteria.minBedrooms);
    }
    if (criteria.minSurface) {
      query = query.gte('surface', criteria.minSurface);
    }
    if (criteria.status) {
      query = query.eq('status', criteria.status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }
}; 