'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Property } from '@/types/property'
import PropertyForm from '../../components/PropertyForm'
import { ArrowLeft } from 'lucide-react'

export default function EditPropertyPage() {
  const params = useParams()
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const loadProperty = async () => {
      if (!params.id) return

      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error) {
        console.error('Erreur lors du chargement de la propriété:', error)
        return
      }

      setProperty(data)
      setLoading(false)
    }

    loadProperty()
  }, [params.id, supabase])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-red-600">Propriété non trouvée</h1>
        <p className="mt-2 text-gray-600">La propriété que vous recherchez n'existe pas ou a été supprimée.</p>
      </div>
    )
  }

  return (
    <div className="px-6 pt-8 pb-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-card-foreground">Modifier la propriété</h1>
          <p className="text-muted-foreground">Modifiez les informations de la propriété et enregistrez vos changements</p>
        </div>
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 px-4 py-2 border rounded-lg text-card-foreground hover:bg-accent transition-colors"
        >
          <ArrowLeft className="h-5 w-5" /> Retour
        </button>
      </div>
      <PropertyForm mode="edit" property={property} />
    </div>
  )
} 