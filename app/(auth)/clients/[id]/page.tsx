'use client'
import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Mail, Phone, User, BadgeEuro, MapPin, FileText, UserCheck } from 'lucide-react'
import Link from 'next/link'
import { Property } from '@/types/property'

export default function ClientDetailsPage({ params }: { params: { id: string } }) {
  const supabase = createClientComponentClient()
  const [client, setClient] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [interestedProperties, setInterestedProperties] = useState<Property[]>([])

  useEffect(() => {
    const fetchClient = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', params.id)
        .single()
      setClient(data)
      setLoading(false)
    }
    fetchClient()
    // eslint-disable-next-line
  }, [params.id])

  useEffect(() => {
    const fetchInterestedProperties = async () => {
      if (!client) return
      // Récupérer les propriétés liées au client
      const { data: clientProps, error: cpError } = await supabase
        .from('client_properties')
        .select('property_id')
        .eq('client_id', client.id)
      if (cpError || !clientProps || clientProps.length === 0) {
        setInterestedProperties([])
        return
      }
      const propertyIds = clientProps.map((cp: any) => cp.property_id)
      // Récupérer les infos des propriétés
      const { data: properties, error: propError } = await supabase
        .from('properties')
        .select('id, title, city, price')
        .in('id', propertyIds)
      setInterestedProperties((properties || []) as Property[])
    }
    fetchInterestedProperties()
  }, [client])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen dark:bg-black">
        <h1 className="text-2xl font-bold dark:text-white mb-4">Détails du client</h1>
        <p className="dark:text-gray-300">Chargement...</p>
      </div>
    )
  }

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen dark:bg-black">
        <h1 className="text-2xl font-bold dark:text-white mb-4">Détails du client</h1>
        <p className="dark:text-red-400">Client introuvable.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-2">
      <div className="w-full max-w-md bg-card text-card-foreground rounded-2xl shadow-2xl p-8 border">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <User className="h-8 w-8 text-primary" />
            <div>
              <h2 className="text-2xl font-bold">{client.first_name} {client.last_name}</h2>
              <span className="text-xs text-muted-foreground">Client #{client.id.slice(0, 8)}</span>
            </div>
          </div>
          <Link href="/clients" className="text-primary text-sm hover:underline">← Retour</Link>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <span>{client.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-muted-foreground" />
            <span>{client.phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">{client.type}</span>
            <span className={`ml-2 px-2 py-0.5 rounded text-xs font-semibold ${client.status === 'active' ? 'bg-green-600/20 text-green-600' : client.status === 'inactive' ? 'bg-red-600/20 text-red-600' : 'bg-yellow-600/20 text-yellow-600'}`}>{client.status}</span>
          </div>
          <div className="flex items-center gap-2">
            <BadgeEuro className="h-5 w-5 text-muted-foreground" />
            <span>Budget : </span>
            <span className="ml-1 font-medium">{client.budget_min ? `${client.budget_min} €` : '—'} - {client.budget_max ? `${client.budget_max} €` : '—'}</span>
          </div>
          {client.preferred_locations && client.preferred_locations.length > 0 && (
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <span>Localisations préférées :</span>
              <span className="ml-1 font-medium">{Array.isArray(client.preferred_locations) ? client.preferred_locations.join(', ') : client.preferred_locations}</span>
            </div>
          )}
          {client.notes && (
            <div className="flex items-start gap-2">
              <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
              <span className="whitespace-pre-line">{client.notes}</span>
            </div>
          )}
          {Array.isArray(client.property_type_preference) && client.property_type_preference.length > 0 && (
            <div className="flex items-start gap-2">
              <span className="font-semibold">Biens intéressés :</span>
              <ul className="ml-2 space-y-1">
                {client.property_type_preference.map((title: string, idx: number) => (
                  <li key={idx} className="text-sm">{title}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="mt-8 text-xs text-muted-foreground text-center">
          ID complet : <span className="font-mono break-all">{client.id}</span>
        </div>
      </div>
    </div>
  )
} 