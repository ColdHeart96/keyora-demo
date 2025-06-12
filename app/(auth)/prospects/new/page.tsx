"use client"
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import ProspectForm from '../components/ProspectForm'
import { ArrowLeft } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function NewProspectPage() {
  const router = useRouter()
  const { user } = useUser()
  const supabase = createClientComponentClient()
  const [properties, setProperties] = useState<any[]>([])

  useEffect(() => {
    const fetchProperties = async () => {
      if (!user) return
      const { data } = await supabase
        .from('properties')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'available')
      setProperties(data || [])
    }
    fetchProperties()
  }, [user])

  const handleCreate = async (data: any) => {
    if (!user) return
    // Calcule les propriétés qui matchent avec les critères du prospect
    const matchedIds = properties.filter((property) => {
      if (data.property_type && property.type !== data.property_type) return false
      if (data.budget_min && property.price < data.budget_min) return false
      if (data.budget_max && property.price > data.budget_max) return false
      return true
    }).map(p => p.id)

    const { error } = await supabase
      .from('prospects')
      .insert([{ ...data, user_id: user.id, created_at: new Date().toISOString(), matched_properties: matchedIds }])
    if (!error) {
      router.push('/prospects')
      router.refresh()
    } else {
      alert("Erreur lors de la création du prospect : " + (error.message || ""))
      console.error(error)
    }
  }

  return (
    <div className="px-6 pt-8 pb-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-card-foreground">Nouveau prospect</h1>
          <p className="text-muted-foreground">Ajoutez un nouveau prospect à votre base de données</p>
        </div>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-4 py-2 border rounded-lg text-card-foreground hover:bg-accent transition-colors"
        >
          <ArrowLeft className="h-5 w-5" /> Retour
        </button>
      </div>
      <div className="flex flex-col items-center min-h-screen dark:bg-black px-2">
        <div className="w-full max-w-2xl">
          <ProspectForm onSubmit={handleCreate} mode="create" />
        </div>
      </div>
    </div>
  )
} 