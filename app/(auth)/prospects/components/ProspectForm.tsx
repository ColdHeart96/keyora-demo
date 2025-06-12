"use client"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"

interface ProspectFormProps {
  initialData?: any
  onSubmit?: (data: any) => Promise<void> | void
  mode?: 'create' | 'edit'
}

export default function ProspectForm({ initialData, onSubmit, mode = 'create' }: ProspectFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    first_name: initialData?.first_name || '',
    last_name: initialData?.last_name || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    budget_min: initialData?.budget_min ? String(initialData.budget_min) : '',
    budget_max: initialData?.budget_max ? String(initialData.budget_max) : '',
    desired_locations: initialData?.desired_locations ? initialData.desired_locations.join(', ') : '',
    property_types: initialData?.property_types ? (Array.isArray(initialData.property_types) ? initialData.property_types[0] || '' : initialData.property_types) : '',
    bedrooms_min: initialData?.bedrooms_min ? String(initialData.bedrooms_min) : '',
    bathrooms_min: initialData?.bathrooms_min ? String(initialData.bathrooms_min) : '',
    surface_min: initialData?.surface_min ? String(initialData.surface_min) : '',
    status: initialData?.status || 'active',
    notes: initialData?.notes || ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    if (onSubmit) {
      await onSubmit({
        ...formData,
        budget_min: formData.budget_min ? parseFloat(formData.budget_min) : null,
        budget_max: formData.budget_max ? parseFloat(formData.budget_max) : null,
        bedrooms_min: formData.bedrooms_min ? parseInt(formData.bedrooms_min) : null,
        bathrooms_min: formData.bathrooms_min ? parseInt(formData.bathrooms_min) : null,
        surface_min: formData.surface_min ? parseFloat(formData.surface_min) : null,
        desired_locations: formData.desired_locations.split(',').map((s: string) => s.trim()).filter(Boolean),
        property_types: formData.property_types ? [formData.property_types] : [],
      })
      setLoading(false)
      return
    }
    setLoading(false)
  }

  return (
    <div className="grid gap-4 grid-cols-1">
      <Card className="border-0 dark:bg-[#1a1a1a] dark:shadow-[0_0_15px_rgba(0,0,0,0.5)]">
        <CardHeader>
          <CardTitle className="dark:text-white">{mode === 'edit' ? 'Modifier le prospect' : 'Informations du prospect'}</CardTitle>
          <CardDescription className="dark:text-gray-400">
            {mode === 'edit' ? 'Modifiez les informations du prospect' : 'Remplissez les informations du nouveau prospect'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="first_name" className="dark:text-gray-200">Prénom</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className="dark:border-gray-800 dark:bg-black/40 dark:text-white"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name" className="dark:text-gray-200">Nom</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  className="dark:border-gray-800 dark:bg-black/40 dark:text-white"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="dark:text-gray-200">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="dark:border-gray-800 dark:bg-black/40 dark:text-white"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="dark:text-gray-200">Téléphone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="dark:border-gray-800 dark:bg-black/40 dark:text-white"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="budget_min" className="dark:text-gray-200">Budget minimum</Label>
                <Input
                  id="budget_min"
                  type="number"
                  value={formData.budget_min}
                  onChange={(e) => setFormData({ ...formData, budget_min: e.target.value })}
                  className="dark:border-gray-800 dark:bg-black/40 dark:text-white"
                  placeholder="€"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="budget_max" className="dark:text-gray-200">Budget maximum</Label>
                <Input
                  id="budget_max"
                  type="number"
                  value={formData.budget_max}
                  onChange={(e) => setFormData({ ...formData, budget_max: e.target.value })}
                  className="dark:border-gray-800 dark:bg-black/40 dark:text-white"
                  placeholder="€"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="desired_locations" className="dark:text-gray-200">Quartiers ou villes souhaités</Label>
                <Input
                  id="desired_locations"
                  value={formData.desired_locations}
                  onChange={(e) => setFormData({ ...formData, desired_locations: e.target.value })}
                  className="dark:border-gray-800 dark:bg-black/40 dark:text-white"
                  placeholder="Ex: Paris 15e, Boulogne, ..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="property_types" className="dark:text-gray-200">Types de bien recherchés</Label>
                <select
                  id="property_types"
                  value={formData.property_types}
                  onChange={(e) => setFormData({ ...formData, property_types: e.target.value })}
                  className="dark:border-gray-800 dark:bg-black/40 dark:text-white"
                >
                  <option value="">Sélectionner un type</option>
                  <option value="Appartement">Appartement</option>
                  <option value="Maison">Maison</option>
                  <option value="Terrain">Terrain</option>
                  <option value="Local commercial">Local commercial</option>
                  <option value="Parking">Parking</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bedrooms_min" className="dark:text-gray-200">Nombre minimum de chambres</Label>
                <Input
                  id="bedrooms_min"
                  type="number"
                  value={formData.bedrooms_min}
                  onChange={(e) => setFormData({ ...formData, bedrooms_min: e.target.value })}
                  className="dark:border-gray-800 dark:bg-black/40 dark:text-white"
                  placeholder="Ex: 2"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bathrooms_min" className="dark:text-gray-200">Nombre minimum de salles de bain</Label>
                <Input
                  id="bathrooms_min"
                  type="number"
                  value={formData.bathrooms_min}
                  onChange={(e) => setFormData({ ...formData, bathrooms_min: e.target.value })}
                  className="dark:border-gray-800 dark:bg-black/40 dark:text-white"
                  placeholder="Ex: 1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="surface_min" className="dark:text-gray-200">Surface minimale (m²)</Label>
                <Input
                  id="surface_min"
                  type="number"
                  value={formData.surface_min}
                  onChange={(e) => setFormData({ ...formData, surface_min: e.target.value })}
                  className="dark:border-gray-800 dark:bg-black/40 dark:text-white"
                  placeholder="Ex: 50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status" className="dark:text-gray-200">Statut</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="dark:border-gray-800 dark:bg-black/40 dark:text-white"
                  required
                >
                  <option value="active">Actif</option>
                  <option value="inactive">Inactif</option>
                  <option value="converted">Converti</option>
                  <option value="new">Nouveau</option>
                  <option value="contacted">Contacté</option>
                  <option value="pending">En attente</option>
                  <option value="follow_up">À relancer</option>
                  <option value="negotiation">En négociation</option>
                  <option value="closed">Closé</option>
                  <option value="rejected">Refusé</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes" className="dark:text-gray-200">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="min-h-[100px] dark:border-gray-800 dark:bg-black/40 dark:text-white"
                placeholder="Ajoutez des notes sur le prospect..."
              />
            </div>
            <div className="flex justify-center space-x-2 mb-24">
              <Link href="/prospects">
                <Button
                  type="button"
                  variant="outline"
                  className="dark:border-gray-800 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  Annuler
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-600 dark:text-white"
              >
                {loading ? (mode === 'edit' ? 'Modification...' : 'Ajout en cours...') : (mode === 'edit' ? 'Enregistrer les modifications' : 'Ajouter le prospect')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 