"use client"
import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Mail, Phone, User, BadgeEuro, UserCheck, Home, MapPin, BedDouble, Bath, Ruler, StickyNote } from 'lucide-react'
import Link from 'next/link'

// Mapping types français <-> anglais (déclaré en dehors de la fonction pour l'utiliser dans le rendu)
const typeMap: Record<string, string> = {
  'Maison': 'house',
  'Appartement': 'apartment',
  'Villa': 'villa',
  'Terrain': 'land',
  'Local commercial': 'commercial',
  'Autre': 'other',
  'house': 'Maison',
  'apartment': 'Appartement',
  'villa': 'Villa',
  'land': 'Terrain',
  'commercial': 'Local commercial',
  'other': 'Autre',
}

export default function ProspectDetailsPage({ params }: { params: { id: string } }) {
  const supabase = createClientComponentClient()
  const [prospect, setProspect] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [properties, setProperties] = useState<any[]>([])

  useEffect(() => {
    const fetchProspect = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('prospects')
        .select('*')
        .eq('id', params.id)
        .single()
      setProspect(data)
      setLoading(false)
    }
    fetchProspect()
  }, [params.id])

  useEffect(() => {
    if (prospect && prospect.user_id) {
      const fetchProperties = async () => {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('user_id', prospect.user_id)
          .eq('status', 'available')
        setProperties(data || [])
      }
      fetchProperties()
    }
  }, [prospect?.user_id])

  function getMatches() {
    if (!prospect) return []
    return properties.filter((property) => {
      if (prospect.property_type && property.type !== prospect.property_type) return false
      if (prospect.budget_min && property.price < prospect.budget_min) return false
      if (prospect.budget_max && property.price > prospect.budget_max) return false
      return true
    })
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen dark:bg-black">
        <h1 className="text-2xl font-bold dark:text-white mb-4">Détails du prospect</h1>
        <p className="dark:text-gray-300">Chargement...</p>
      </div>
    )
  }

  if (!prospect) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen dark:bg-black">
        <h1 className="text-2xl font-bold dark:text-white mb-4">Détails du prospect</h1>
        <p className="dark:text-red-400">Prospect introuvable.</p>
      </div>
    )
  }

  // Debug : afficher les propriétés et le prospect dans la console
  console.log('PROPERTIES:', properties)
  console.log('PROSPECT:', prospect)

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-2">
      <div className="w-full max-w-md bg-card text-card-foreground rounded-2xl shadow-2xl p-8 border">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <User className="h-8 w-8 text-primary" />
            <div>
              <h2 className="text-2xl font-bold">{prospect.first_name || ''} {prospect.last_name || ''}</h2>
              <span className="text-xs text-muted-foreground">Prospect #{prospect.id?.slice(0, 8)}</span>
            </div>
          </div>
          <Link href="/prospects" className="text-primary text-sm hover:underline">← Retour</Link>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <span>{prospect.email || '—'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-muted-foreground" />
            <span>{prospect.phone || '—'}</span>
          </div>
          <div className="flex items-center gap-2">
            <BadgeEuro className="h-5 w-5 text-muted-foreground" />
            <span>Budget :</span>
            <span className="ml-1 font-medium">{prospect.budget_min ? `${prospect.budget_min} €` : '—'}{prospect.budget_max ? ` - ${prospect.budget_max} €` : ''}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            <span>Quartiers/Villes souhaités :</span>
            <span className="ml-1 font-medium">{Array.isArray(prospect.desired_locations) && prospect.desired_locations.length > 0 ? prospect.desired_locations.join(', ') : '—'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Home className="h-5 w-5 text-muted-foreground" />
            <span>Types de bien recherchés :</span>
            <span className="ml-1 font-medium">{Array.isArray(prospect.property_types) && prospect.property_types.length > 0 ? prospect.property_types.join(', ') : '—'}</span>
          </div>
          <div className="flex items-center gap-2">
            <BedDouble className="h-5 w-5 text-muted-foreground" />
            <span>Chambres min :</span>
            <span className="ml-1 font-medium">{prospect.bedrooms_min ?? '—'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Bath className="h-5 w-5 text-muted-foreground" />
            <span>Salles de bain min :</span>
            <span className="ml-1 font-medium">{prospect.bathrooms_min ?? '—'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Ruler className="h-5 w-5 text-muted-foreground" />
            <span>Surface min :</span>
            <span className="ml-1 font-medium">{prospect.surface_min ? `${prospect.surface_min} m²` : '—'}</span>
          </div>
          {prospect.notes && (
            <div className="flex items-start gap-2">
              <StickyNote className="h-5 w-5 text-muted-foreground mt-0.5" />
              <span className="whitespace-pre-line">{prospect.notes}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span>Statut :</span>
            <span className="ml-2 px-2 py-0.5 rounded text-xs font-semibold bg-green-600/20 text-green-600">{prospect.status}</span>
          </div>
        </div>
        <div className="mt-8 text-xs text-muted-foreground text-center">
          ID complet : <span className="font-mono break-all">{prospect.id}</span>
        </div>
        <div className="mt-8 bg-card rounded-xl p-6 border">
          <div className="flex items-center gap-2 mb-2">
            <Home className="h-5 w-5 text-primary" />
            <span className="text-base font-semibold text-card-foreground">Biens correspondant aux critères</span>
          </div>
          <div className="flex flex-col gap-1 mt-2">
            {getMatches().length === 0 ? (
              <span className="text-xs text-muted-foreground">Aucun bien correspondant</span>
            ) : (
              getMatches().map((property: any) => (
                <div key={property.id} className="rounded-lg border p-3 mb-2 bg-card text-card-foreground flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-blue-700 dark:text-blue-400">{property.title}</span>
                    <span className="text-xs text-muted-foreground">{typeMap[property.type] || property.type}</span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <span className="text-card-foreground">🏙️ {property.city}</span>
                    <span className="text-card-foreground">💶 {property.price?.toLocaleString('fr-FR')} €</span>
                    {property.surface && <span className="text-card-foreground">📏 {property.surface} m²</span>}
                    {property.rooms && <span className="text-card-foreground">🛏️ {property.rooms} pièces</span>}
                  </div>
                  <Link href={`/properties?selected=${property.id}`} className="text-primary hover:underline text-xs mt-1 self-end">Voir détail</Link>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 