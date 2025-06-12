"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import ClientForm from '../../components/ClientForm'

export default function EditClientPage({ params }: { params: { id: string } }) {
  const supabase = createClientComponentClient()
  const router = useRouter()
  const [client, setClient] = useState<any>(null)
  const [loading, setLoading] = useState(true)

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

  const handleUpdate = async (updatedData: any) => {
    const { error } = await supabase
      .from('clients')
      .update(updatedData)
      .eq('id', params.id)
    if (!error) {
      router.push(`/clients/${params.id}`)
      router.refresh()
    } else {
      alert("Erreur lors de la mise à jour du client")
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen dark:bg-black">
        <h1 className="text-2xl font-bold dark:text-white mb-4">Modifier le client</h1>
        <p className="dark:text-gray-300">Chargement...</p>
      </div>
    )
  }

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen dark:bg-black">
        <h1 className="text-2xl font-bold dark:text-white mb-4">Modifier le client</h1>
        <p className="dark:text-red-400">Client introuvable.</p>
      </div>
    )
  }

  return (
    <div className="px-6 pt-8 pb-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-card-foreground">Modifier le client</h1>
          <p className="text-muted-foreground">Modifiez les informations du client et enregistrez vos changements</p>
        </div>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-4 py-2 border rounded-lg text-card-foreground hover:bg-accent transition-colors"
        >
          <span className="text-xl">←</span> Retour
        </button>
      </div>
      <ClientForm initialData={client} onSubmit={handleUpdate} mode="edit" />
    </div>
  )
} 