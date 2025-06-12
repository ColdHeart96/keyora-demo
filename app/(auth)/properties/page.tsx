'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Property } from '@/types/property'
import { Button } from '@/components/ui/button'
import { PlusIcon, PencilIcon, TrashIcon, ImageIcon, HomeIcon, Building2Icon, BarChart3Icon, DollarSignIcon } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from 'next/link'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'

interface PropertyStats {
  totalProperties: number
  forSale: number
  forRent: number
  sold: number
  totalValue: number
}

interface PriceRangeItem {
  name: string
  value: number
}

export default function PropertiesPage() {
  const { user } = useUser()
  const [properties, setProperties] = useState<Property[]>([])
  const [stats, setStats] = useState<PropertyStats>({
    totalProperties: 0,
    forSale: 0,
    forRent: 0,
    sold: 0,
    totalValue: 0,
  })
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [viewMode, setViewMode] = useState<'card' | 'detail'>('card')
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const supabase = createClientComponentClient()
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null)

  useEffect(() => {
    if (user) {
      loadProperties()
    }
  }, [user, supabase])

  const loadProperties = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('user_id', user.id)

    if (error) {
      console.error('Erreur lors du chargement des propriétés:', error)
      return
    }

    const propertiesData = data as Property[] || []
    setProperties(propertiesData)
    
    // Calculer les statistiques
    const newStats = {
      totalProperties: propertiesData.length,
      forSale: propertiesData.filter((p: Property) => p.status === 'available').length,
      forRent: propertiesData.filter((p: Property) => p.status === 'rented').length,
      sold: propertiesData.filter((p: Property) => p.status === 'sold').length,
      totalValue: propertiesData.reduce((sum: number, p: Property) => sum + (p.price || 0), 0),
    }
    setStats(newStats)
  }

  const handleDeleteProperty = async (propertyId: string) => {
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', propertyId)

    if (error) {
      console.error('Erreur lors de la suppression:', error)
      return
    }

    await loadProperties()
    if (selectedProperty?.id === propertyId) {
      setSelectedProperty(null)
      setViewMode('card')
    }
    setDeleteConfirmOpen(false)
    setPropertyToDelete(null)
  }

  const handleDeleteImage = async (propertyId: string, imageUrl: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette image ?')) return

    const property = properties.find(p => p.id === propertyId)
    if (!property || !property.images) return

    const updatedImages = property.images.filter(img => img !== imageUrl)

    const { error } = await supabase
      .from('properties')
      .update({ images: updatedImages })
      .eq('id', propertyId)

    if (error) {
      console.error('Erreur lors de la suppression de l\'image:', error)
      return
    }

    await loadProperties()
    if (selectedProperty?.id === propertyId) {
      const updatedProperty = properties.find(p => p.id === propertyId)
      setSelectedProperty(updatedProperty || null)
      setCurrentImageIndex(0)
    }
  }

  const openDeleteConfirm = (property: Property) => {
    setPropertyToDelete(property)
    setDeleteConfirmOpen(true)
  }

  const chartData = [
    { name: 'À vendre', value: stats.forSale, color: '#3B82F6' },
    { name: 'En location', value: stats.forRent, color: '#10B981' },
    { name: 'Vendus', value: stats.sold, color: '#6366F1' }
  ]

  const priceRangeData = properties.reduce((acc, property) => {
    if (!property.price) return acc
    
    let range = ''
    if (property.price < 250000) range = 'Moins de 250K€'
    else if (property.price < 500000) range = '250K€ - 500K€'
    else if (property.price < 750000) range = '500K€ - 750K€'
    else if (property.price < 1000000) range = '750K€ - 1M€'
    else range = 'Plus de 1M€'

    const existingRange = acc.find(r => r.name === range)
    if (existingRange) {
      existingRange.value++
    } else {
      acc.push({ name: range, value: 1 })
    }
    return acc
  }, [] as { name: string; value: number }[])

  if (viewMode === 'detail' && selectedProperty) {
    return (
      <>
        <Navbar title="Détails de la propriété">
          <Button 
            variant="outline"
            onClick={() => setViewMode('card')}
          >
            Retour à la liste
          </Button>
        </Navbar>

        <div className="flex-1 space-y-8 p-8 pt-6">
          <Card>
            <CardHeader>
              <CardTitle>{selectedProperty.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Galerie d'images */}
              <div className="space-y-4">
                <div className="aspect-video relative rounded-lg overflow-hidden bg-muted">
                  {selectedProperty.images && selectedProperty.images.length > 0 ? (
                    <img 
                      src={selectedProperty.images[currentImageIndex]} 
                      alt={`${selectedProperty.title} - Image ${currentImageIndex + 1}`}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                </div>
                
                {/* Miniatures */}
                {selectedProperty.images && selectedProperty.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {selectedProperty.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`relative flex-shrink-0 w-20 h-20 rounded-md overflow-hidden ${
                          idx === currentImageIndex ? 'ring-2 ring-blue-600' : ''
                        }`}
                      >
                        <img 
                          src={img} 
                          alt={`Miniature ${idx + 1}`}
                          className="object-cover w-full h-full"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Informations détaillées */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Informations générales</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Prix</span>
                      <span className="font-medium text-blue-600">
                        {selectedProperty.price?.toLocaleString('fr-FR')} €
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Surface</span>
                      <span className="font-medium">{selectedProperty.surface} m²</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type</span>
                      <span className="font-medium capitalize">{selectedProperty.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Statut</span>
                      <span className="font-medium">{
                        selectedProperty.status === 'available' ? 'À vendre' :
                        selectedProperty.status === 'rented' ? 'En location' : 'Vendu'
                      }</span>
                    </div>
                    {selectedProperty.rooms && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Pièces</span>
                        <span className="font-medium">{selectedProperty.rooms}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Adresse</h3>
                  <div className="space-y-2">
                    {selectedProperty.address && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Adresse</span>
                        <span className="font-medium">{selectedProperty.address}</span>
                      </div>
                    )}
                    {selectedProperty.city && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Ville</span>
                        <span className="font-medium">{selectedProperty.city}</span>
                      </div>
                    )}
                    {selectedProperty.postal_code && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Code postal</span>
                        <span className="font-medium">{selectedProperty.postal_code}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {selectedProperty.description && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Description</h3>
                  <p className="text-muted-foreground">{selectedProperty.description}</p>
                </div>
              )}

              {selectedProperty.features && selectedProperty.features.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Caractéristiques</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    {selectedProperty.features.map((feature, idx) => (
                      <li key={idx}>{feature}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <Link href={`/properties/edit/${selectedProperty.id}`}>
                  <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                    <PencilIcon className="h-4 w-4" />
                    Modifier
                  </Button>
                </Link>
                <Button 
                  variant="destructive"
                  onClick={() => openDeleteConfirm(selectedProperty)}
                  className="gap-2"
                >
                  <TrashIcon className="h-4 w-4" />
                  Supprimer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar title="Propriétés">
        <Link href="/properties/new">
          <Button variant="default" className="bg-blue-600 hover:bg-blue-700">
            <PlusIcon className="h-4 w-4 mr-2" />
            Ajouter un bien
          </Button>
        </Link>
      </Navbar>

      <div className="flex-1 space-y-8 p-8 pt-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total des biens</CardTitle>
              <div className="text-2xl font-bold">{stats.totalProperties}</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalValue.toLocaleString('fr-FR')} €</div>
              <p className="text-xs text-muted-foreground">Valeur totale du portefeuille</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">À vendre</CardTitle>
              <div className="text-2xl font-bold">{stats.forSale}</div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En location</CardTitle>
              <div className="text-2xl font-bold">{stats.forRent}</div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vendus</CardTitle>
              <div className="text-2xl font-bold">{stats.sold}</div>
            </CardHeader>
          </Card>
        </div>

        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Répartition des biens</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Biens par gamme de prix</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priceRangeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Liste des propriétés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {properties.map((property) => (
                <div key={property.id} className="rounded-lg border overflow-hidden">
                  <div className="aspect-video relative bg-muted">
                    {property.images && property.images[0] ? (
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold">{property.title}</h3>
                        <p className="text-sm text-muted-foreground">{property.address}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-blue-600">{property.price?.toLocaleString('fr-FR')} €</div>
                        <span className="text-sm text-muted-foreground">{property.surface} m²</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                        {property.status === 'available' ? 'À vendre' : 
                         property.status === 'rented' ? 'En location' : 'Vendu'}
                      </span>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedProperty(property)
                            setViewMode('detail')
                          }}
                        >
                          Détails
                        </Button>
                        <Link href={`/properties/edit/${property.id}`}>
                          <Button variant="outline" size="sm">
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openDeleteConfirm(property)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de confirmation de suppression */}
      <Transition appear show={deleteConfirmOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setDeleteConfirmOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100"
                  >
                    Confirmer la suppression
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Êtes-vous sûr de vouloir supprimer la propriété "{propertyToDelete?.title}" ?
                      Cette action est irréversible.
                    </p>
                  </div>

                  <div className="mt-4 flex justify-end space-x-3">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-red-100 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                      onClick={() => propertyToDelete && handleDeleteProperty(propertyToDelete.id)}
                    >
                      Supprimer
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                      onClick={() => setDeleteConfirmOpen(false)}
                    >
                      Annuler
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
} 