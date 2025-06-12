export type ClientType = 'buyer' | 'seller' | 'both'
export type ClientStatus = 'active' | 'inactive' | 'stopped'  

export interface Client {
  id: string
  user_id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  type: ClientType
  status: ClientStatus
  notes?: string
  budget_min?: number
  budget_max?: number
  preferred_locations?: string[]
  property_type_preference?: string[]
  property_id?: string
  created_at: string
  updated_at: string
}

export type CreateClientInput = Omit<Client, 'id' | 'created_at' | 'updated_at'> 