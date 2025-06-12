"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import ProspectForm from '../../components/ProspectForm'
import { Home, ArrowLeft } from 'lucide-react'

export default function EditProspectPage({ params }: { params: { id: string } }) {
  const supabase = createClientComponentClient()
  const router = useRouter()
  const [prospect, setProspect] = useState<any>(null)
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

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
    const fetchProperties = async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('user_id', prospect?.user_id)
        .eq('status', 'available')
      setProperties(data || [])
    }
    fetchProspect()
    // fetch properties only after prospect is loaded
    // eslint-disable-next-line
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
  }, [prospect])

  const handleUpdate = async (updatedData: any) => {
    // Calcule les propriétés qui matchent avec les nouveaux critères
    const matchedIds = properties.filter((property) => {
      if (updatedData.property_type && property.type !== updatedData.property_type) return false
      if (updatedData.budget_min && property.price < updatedData.budget_min) return false
      if (updatedData.budget_max && property.price > updatedData.budget_max) return false
      return true
    }).map(p => p.id)

    const { error } = await supabase
      .from('prospects')
      .update({ ...updatedData, matched_properties: matchedIds })
      .eq('id', params.id)
    if (!error) {
      router.push(`/prospects/${params.id}`)
      router.refresh()
    } else {
      alert("Erreur lors de la mise à jour du prospect")
    }
  }

  // Fonction de matching
  function getMatches() {
    if (!prospect) return []
    return properties.filter((property) => {
      if (prospect.property_type && property.type !== prospect.property_type) return false
      if (prospect.budget_min && property.price < prospect.budget_min) return false
      if (prospect.budget_max && property.price > prospect.budget_max) return false
      return true
    })
  }

  if (loading || !prospect) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen dark:bg-black">
        <h1 className="text-2xl font-bold dark:text-white mb-4">Modifier le prospect</h1>
        <p className="dark:text-red-400">Prospect introuvable.</p>
      </div>
    )
  }

  const matches = getMatches()

  return (
    <div className="px-6 pt-8 pb-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-card-foreground">Modifier le prospect</h1>
          <p className="text-muted-foreground">Modifiez les informations du prospect et enregistrez vos changements</p>
        </div>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-4 py-2 border rounded-lg text-card-foreground hover:bg-accent transition-colors"
        >
          <ArrowLeft className="h-5 w-5" /> Retour
        </button>
      </div>
        <ProspectForm initialData={prospect} onSubmit={handleUpdate} mode="edit" />
      <div className="mt-8 bg-card rounded-xl p-6 border">
          <div className="flex items-center gap-2 mb-2">
          <Home className="h-5 w-5 text-primary" />
          <span className="text-base font-semibold text-card-foreground">Biens correspondant aux critères</span>
          </div>
          <div className="flex flex-col gap-1 mt-2">
            {matches.length === 0 ? (
            <span className="text-xs text-muted-foreground">Aucun bien correspondant</span>
            ) : (
              matches.map((property: any) => (
              <span key={property.id} className="text-sm text-green-600 dark:text-green-400">
                  {property.title} — {property.city} — {property.price} €
                </span>
              ))
            )}
        </div>
      </div>
    </div>
  )
} 