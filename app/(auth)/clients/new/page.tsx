'use client'

import { useState, useEffect } from "react"
import { useUser } from '@clerk/nextjs'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface Property {
  id: string
  title: string
  type: string
  price: number
  address: string
  city: string
}

interface FormattedData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  type: string;
  status: string;
  notes: string;
  budget_min: number | null;
  budget_max: number | null;
  preferred_locations: string[];
  user_id: string;
}

export default function NewClientPage() {
  const { user } = useUser()
  const supabase = createClientComponentClient()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [properties, setProperties] = useState<Property[]>([])
  const [selectedProperties, setSelectedProperties] = useState<string[]>([])
  const [openProperties, setOpenProperties] = useState(false)

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    type: 'buyer', // Changé de 'acheteur' à 'buyer'
    status: 'active', // Changé de 'actif' à 'active'
    notes: '',
    budget_min: '',
    budget_max: '',
    preferred_locations: '',
    property_ids: [] as string[]
  })

  useEffect(() => {
    const fetchProperties = async () => {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from('properties')
          .select('id, title, type, price, address, city')
          .eq('user_id', user.id)
          .eq('status', 'available')

        if (error) throw error

        setProperties(data || [])
      } catch (error) {
        console.error('Erreur lors de la récupération des biens:', error)
      }
    }

    fetchProperties()
  }, [user, supabase])

  useEffect(() => {
    // Réinitialiser les propriétés sélectionnées lorsque les propriétés sont chargées
    setSelectedProperties([]);
  }, [user, supabase]);

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      property_ids: selectedProperties
    }));
  }, [selectedProperties]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      setLoading(true)

      // Basic validation
      if (!formData.first_name || !formData.last_name || !formData.email || !formData.phone) {
        toast({
          variant: "destructive",
          title: "Erreur de validation",
          description: "Veuillez remplir tous les champs obligatoires.",
        })
        return
      }

      // Format the data before sending
      const formattedData = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        type: formData.type || 'acheteur',  // Valeur par défaut
        status: formData.status || 'actif',  // Valeur par défaut
        user_id: user.id,
        property_id: selectedProperties.length > 0 ? selectedProperties[0] : null,
        property_type_preference: properties
          .filter(p => selectedProperties.includes(p.id))
          .map(p => p.title),
      }

      console.log('Type original:', formData.type);
      console.log('Status original:', formData.status);
      console.log('Données formatées à envoyer:', formattedData);

      const { data, error } = await supabase
        .from('clients')
        .insert([formattedData])
        .select()

      if (error) {
        console.error('Erreur détaillée:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        })
        throw error
      }

      // Si l'insertion réussit, on ajoute les données additionnelles dans une mise à jour
      if (data && data[0]?.id) {
        const clientId = data[0].id;
        console.log('Client créé avec ID:', clientId);
        console.log('Propriétés sélectionnées avant insertion:', selectedProperties);
        
        const additionalData = {
          notes: formData.notes ? formData.notes.trim() : null,
          budget_min: formData.budget_min ? parseFloat(formData.budget_min) : null,
          budget_max: formData.budget_max ? parseFloat(formData.budget_max) : null,
          preferred_locations: formData.preferred_locations ? formData.preferred_locations.split(',').map(loc => loc.trim()).filter(Boolean) : []
        }

        const { error: updateError } = await supabase
          .from('clients')
          .update(additionalData)
          .eq('id', clientId)

        if (updateError) {
          console.error('Erreur lors de la mise à jour des données additionnelles:', updateError)
        }
        
        // Ajouter les relations client-propriété dans la table de liaison
        if (selectedProperties.length > 0) {
          console.log('Nombre de propriétés sélectionnées:', selectedProperties.length);
          
          const clientPropertiesData = selectedProperties.map(propertyId => ({
            client_id: clientId,
            property_id: propertyId,
            user_id: user.id
          }));
          
          console.log('Données à insérer dans client_properties:', JSON.stringify(clientPropertiesData));
          
          try {
            const { data: insertedData, error: propertyLinkError } = await supabase
              .from('client_properties')
              .insert(clientPropertiesData)
              .select();
            
            if (propertyLinkError) {
              console.error('Erreur détaillée lors de la liaison des propriétés:', {
                code: propertyLinkError.code,
                message: propertyLinkError.message,
                details: propertyLinkError.details,
                hint: propertyLinkError.hint
              });
            } else {
              console.log('Relations client-propriétés créées avec succès:', insertedData);
            }
          } catch (e) {
            console.error('Exception lors de l\'insertion dans client_properties:', e);
          }
        } else {
          console.log('Aucune propriété sélectionnée, pas d\'insertion dans client_properties');
        }
      }

      toast({
        title: "Client ajouté",
        description: "Le nouveau client a été ajouté avec succès.",
      })

      router.push('/clients')
      router.refresh()
    } catch (error: any) {
      console.error('Erreur lors de l\'ajout du client:', error)
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de l'ajout du client.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 dark:bg-black">
      <div className="flex items-center justify-between space-y-2 pb-10">
        <div className="space-y-0.5">
          <h2 className="text-2xl font-bold tracking-tight dark:text-white">Nouveau client</h2>
          <p className="text-muted-foreground dark:text-gray-400">
            Ajoutez un nouveau client à votre base de données
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Link href="/clients">
            <Button variant="outline" className="dark:border-gray-800 dark:text-gray-200 dark:hover:bg-gray-800">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1">
        <Card className="border-0 dark:bg-[#1a1a1a] dark:shadow-[0_0_15px_rgba(0,0,0,0.5)]">
          <CardHeader>
            <CardTitle className="dark:text-white">Informations du client</CardTitle>
            <CardDescription className="dark:text-gray-400">
              Remplissez les informations du nouveau client
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
                  <Label htmlFor="type" className="dark:text-gray-200">Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger className="dark:border-gray-800 dark:bg-black/40 dark:text-white">
                      <SelectValue placeholder="Sélectionnez un type" />
                    </SelectTrigger>
                    <SelectContent className="dark:border-gray-800 dark:bg-[#1a1a1a]">
                      <SelectItem value="buyer">Acheteur</SelectItem>
                      <SelectItem value="seller">Vendeur</SelectItem>
                      <SelectItem value="les deux">Les deux</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status" className="dark:text-gray-200">Statut</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger className="dark:border-gray-800 dark:bg-black/40 dark:text-white">
                      <SelectValue placeholder="Sélectionnez un statut" />
                    </SelectTrigger>
                    <SelectContent className="dark:border-gray-800 dark:bg-[#1a1a1a]">
                      <SelectItem value="active">Actif</SelectItem>
                      <SelectItem value="stopped">En pause</SelectItem>
                      <SelectItem value="inactive">Inactif</SelectItem>
                    </SelectContent>
                  </Select>
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
                  <Label htmlFor="preferred_locations" className="dark:text-gray-200">Localisations préférées</Label>
                  <Input
                    id="preferred_locations"
                    value={formData.preferred_locations}
                    onChange={(e) => setFormData({ ...formData, preferred_locations: e.target.value })}
                    className="dark:border-gray-800 dark:bg-black/40 dark:text-white"
                    placeholder="Paris, Lyon, Marseille..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="property_preference" className="dark:text-gray-200">
                    Biens intéressés
                  </Label>
                  <Popover open={openProperties} onOpenChange={setOpenProperties}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openProperties}
                        className="w-full justify-center dark:border-gray-800 dark:bg-black/40 dark:text-white"
                      >
                        {selectedProperties.length > 0
                          ? `${selectedProperties.length} bien${selectedProperties.length > 1 ? 's' : ''} sélectionné${selectedProperties.length > 1 ? 's' : ''}`
                          : "Sélectionnez les biens"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0 dark:bg-[#1a1a1a] dark:border-gray-800">
                      <Command className="dark:bg-transparent">
                        <CommandInput placeholder="Rechercher un bien..." className="dark:bg-transparent dark:text-white" />
                        <CommandEmpty className="dark:text-gray-400">Aucun bien trouvé.</CommandEmpty>
                        <CommandGroup className="max-h-64 overflow-auto">
                          {properties.map((property) => (
                            <CommandItem
                              key={property.id}
                              value={property.title}
                              onSelect={() => {
                                const newSelectedProperties = selectedProperties.includes(property.id)
                                  ? selectedProperties.filter(id => id !== property.id)
                                  : [...selectedProperties, property.id];
                                
                                setSelectedProperties(newSelectedProperties);
                                console.log('ID de la propriété sélectionnée/désélectionnée:', property.id);
                                console.log('Nouvelle liste des propriétés sélectionnées:', newSelectedProperties);
                              }}
                              className="dark:text-white dark:hover:bg-gray-800"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedProperties.includes(property.id) ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <div className="flex flex-col">
                                <span>{property.title}</span>
                                <span className="text-sm text-gray-500">
                                  {property.type} - {property.city} - {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(property.price)}
                                </span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedProperties.map((propertyId) => {
                      const property = properties.find(p => p.id === propertyId)
                      if (!property) return null
                      return (
                        <Badge
                          key={propertyId}
                          variant="secondary"
                          className="dark:bg-gray-800 dark:text-white"
                        >
                          {property.title}
                          <button
                            className="ml-1 hover:text-red-500"
                            onClick={(e) => {
                              e.preventDefault()
                              setSelectedProperties(prev =>
                                prev.filter(id => id !== propertyId)
                              )
                            }}
                          >
                            ×
                          </button>
                        </Badge>
                      )
                    })}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="dark:text-gray-200">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="min-h-[100px] dark:border-gray-800 dark:bg-black/40 dark:text-white"
                  placeholder="Ajoutez des notes sur le client..."
                />
              </div>

              <div className="flex justify-center space-x-2">
                <Link href="/clients">
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
                  {loading ? "Ajout en cours..." : "Ajouter le client"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 
