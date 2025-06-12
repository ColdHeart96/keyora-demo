export type ProspectStatus = 'active' | 'inactive' | 'converted'
export type PropertyType = 'house' | 'apartment' | 'land' | 'commercial'

export interface Prospect {
  id: string
  user_id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  status: ProspectStatus
  budget_min?: number
  budget_max?: number
  desired_locations: string[]
  property_types: PropertyType[]
  bedrooms_min?: number
  bathrooms_min?: number
  surface_min?: number
  notes?: string
  matched_properties: PropertyMatch[] // Modifié pour stocker les scores
  last_contact?: string
  created_at: string
  updated_at: string
}

export interface PropertyMatch {
  property_id: string
  score: number
  criteria: {
    budget: boolean
    type: boolean
    location: boolean
    bedrooms: boolean
    bathrooms: boolean
    surface: boolean
  }
}

export type CreateProspectInput = Omit<Prospect, 'id' | 'created_at' | 'updated_at' | 'matched_properties'>

export interface ProspectStats {
  totalProspects: number
  activeProspects: number
  convertedProspects: number
  matchedProspects: number
  averageBudget: number
} 