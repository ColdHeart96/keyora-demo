'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ImageIcon, XIcon } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Navbar } from '@/components/navbar'

export default function NewPropertyPage() {
  const router = useRouter()
  const { user } = useUser()
  const supabase = createClientComponentClient()
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<string[]>([])

  const propertyTypes = {
    house: 'Maison',
    apartment: 'Appartement',
    villa: 'Villa',
    land: 'Terrain',
    commercial: 'Local commercial'
  } as const;

  type PropertyType = keyof typeof propertyTypes;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    currency: 'EUR',
    surface: '',
    rooms: '',
    bedrooms: '',
    bathrooms: '',
    type: 'house' as PropertyType,
    status: 'available',
    address: '',
    city: '',
    postal_code: '',
    country: 'France',
    features: [],
    images: []
  })

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setLoading(true)
    try {
      const newImages = []
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `${user?.id}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('properties')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('properties')
          .getPublicUrl(filePath)

        newImages.push(publicUrl)
      }

      setImages([...images, ...newImages])
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error)
      alert('Une erreur est survenue lors du téléchargement des images')
    } finally {
      setLoading(false)
    }
  }

  const handleImageDelete = async (imageUrl: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette image ?')) return

    const fileName = imageUrl.split('/').pop()
    if (!fileName) return

    try {
      const { error } = await supabase.storage
        .from('properties')
        .remove([`${user?.id}/${fileName}`])

      if (error) throw error

      setImages(images.filter(img => img !== imageUrl))
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      alert('Une erreur est survenue lors de la suppression de l\'image')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    // Validation des champs requis
    if (!formData.title || !formData.price || !formData.address || !formData.city || !formData.type) {
      alert('Veuillez remplir tous les champs obligatoires')
      return
    }

    // Validation spécifique du type
    const validTypes = ['house', 'apartment', 'villa', 'land', 'commercial'];
    if (!validTypes.includes(formData.type)) {
      console.error('Type invalide:', formData.type);
      console.error('Types valides:', validTypes);
      alert('Type de propriété invalide');
      return;
    }

    setLoading(true)
    try {
      const propertyData = {
        title: formData.title.trim(),
        description: formData.description?.trim() || '',
        price: parseFloat(formData.price),
        currency: formData.currency,
        surface: formData.surface ? parseFloat(formData.surface) : null,
        rooms: formData.rooms ? parseInt(formData.rooms) : null,
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
        type: formData.type,
        status: formData.status || 'available',
        address: formData.address.trim(),
        city: formData.city.trim(),
        postal_code: formData.postal_code?.trim() || null,
        country: formData.country,
        features: formData.features || [],
        images: images || [],
        user_id: user.id
      }

      console.log('Type de propriété:', formData.type);
      console.log('Type de propriété (typeof):', typeof formData.type);
      console.log('Données complètes envoyées à Supabase:', JSON.stringify(propertyData, null, 2));

      const { data, error } = await supabase
        .from('properties')
        .insert([propertyData])
        .select()

      if (error) {
        console.error('Erreur Supabase détaillée:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          propertyType: formData.type,
          validTypes
        });
        alert(`Erreur lors de la création: ${error.message}`);
        throw error;
      }

      console.log('Propriété créée avec succès:', data);
      router.push('/properties');
      router.refresh();
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      alert('Une erreur est survenue lors de la création de la propriété');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar title="Nouvelle propriété">
        <Button 
          variant="outline"
          onClick={() => router.back()}
          className="bg-blue-600 text-white hover:bg-blue-700"
        >
          Retour
        </Button>
      </Navbar>

      <div className="flex-1 space-y-8 p-8 pt-6">
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Informations de base</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Titre</Label>
                <Input
                  id="title"
                  placeholder="Ex: Magnifique villa avec piscine"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Décrivez la propriété en détail..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Prix</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="Ex: 250000"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Devise</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => setFormData({ ...formData, currency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une devise" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="CHF">CHF</SelectItem>
                      <SelectItem value="CAD">CAD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="surface">Surface (m²)</Label>
                  <Input
                    id="surface"
                    type="number"
                    placeholder="Ex: 120"
                    value={formData.surface}
                    onChange={(e) => setFormData({ ...formData, surface: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rooms">Pièces</Label>
                  <Input
                    id="rooms"
                    type="number"
                    placeholder="Ex: 5"
                    value={formData.rooms}
                    onChange={(e) => setFormData({ ...formData, rooms: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bedrooms">Chambres</Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    placeholder="Ex: 3"
                    value={formData.bedrooms}
                    onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bathrooms">SDB</Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    placeholder="Ex: 2"
                    value={formData.bathrooms}
                    onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type de bien</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: PropertyType) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un type" />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.entries(propertyTypes) as [PropertyType, string][]).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Statut</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">À vendre</SelectItem>
                      <SelectItem value="rented">En location</SelectItem>
                      <SelectItem value="sold">Vendu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Adresse</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="address">Adresse</Label>
                <Input
                  id="address"
                  placeholder="Numéro et nom de rue"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Ville</Label>
                  <Input
                    id="city"
                    placeholder="Nom de la ville"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postal_code">Code postal</Label>
                  <Input
                    id="postal_code"
                    placeholder="Code postal"
                    value={formData.postal_code}
                    onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Pays</Label>
                  <Select
                    value={formData.country}
                    onValueChange={(value) => setFormData({ ...formData, country: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un pays" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="France">France</SelectItem>
                      <SelectItem value="Afghanistan">Afghanistan</SelectItem>
                      <SelectItem value="Afrique du Sud">Afrique du Sud</SelectItem>
                      <SelectItem value="Albanie">Albanie</SelectItem>
                      <SelectItem value="Algérie">Algérie</SelectItem>
                      <SelectItem value="Allemagne">Allemagne</SelectItem>
                      <SelectItem value="Andorre">Andorre</SelectItem>
                      <SelectItem value="Angola">Angola</SelectItem>
                      <SelectItem value="Antigua-et-Barbuda">Antigua-et-Barbuda</SelectItem>
                      <SelectItem value="Arabie Saoudite">Arabie Saoudite</SelectItem>
                      <SelectItem value="Argentine">Argentine</SelectItem>
                      <SelectItem value="Arménie">Arménie</SelectItem>
                      <SelectItem value="Australie">Australie</SelectItem>
                      <SelectItem value="Autriche">Autriche</SelectItem>
                      <SelectItem value="Azerbaïdjan">Azerbaïdjan</SelectItem>
                      <SelectItem value="Bahamas">Bahamas</SelectItem>
                      <SelectItem value="Bahreïn">Bahreïn</SelectItem>
                      <SelectItem value="Bangladesh">Bangladesh</SelectItem>
                      <SelectItem value="Barbade">Barbade</SelectItem>
                      <SelectItem value="Belgique">Belgique</SelectItem>
                      <SelectItem value="Belize">Belize</SelectItem>
                      <SelectItem value="Bénin">Bénin</SelectItem>
                      <SelectItem value="Bhoutan">Bhoutan</SelectItem>
                      <SelectItem value="Biélorussie">Biélorussie</SelectItem>
                      <SelectItem value="Birmanie">Birmanie</SelectItem>
                      <SelectItem value="Bolivie">Bolivie</SelectItem>
                      <SelectItem value="Bosnie-Herzégovine">Bosnie-Herzégovine</SelectItem>
                      <SelectItem value="Botswana">Botswana</SelectItem>
                      <SelectItem value="Brésil">Brésil</SelectItem>
                      <SelectItem value="Brunei">Brunei</SelectItem>
                      <SelectItem value="Bulgarie">Bulgarie</SelectItem>
                      <SelectItem value="Burkina Faso">Burkina Faso</SelectItem>
                      <SelectItem value="Burundi">Burundi</SelectItem>
                      <SelectItem value="Cambodge">Cambodge</SelectItem>
                      <SelectItem value="Cameroun">Cameroun</SelectItem>
                      <SelectItem value="Canada">Canada</SelectItem>
                      <SelectItem value="Cap-Vert">Cap-Vert</SelectItem>
                      <SelectItem value="Chili">Chili</SelectItem>
                      <SelectItem value="Chine">Chine</SelectItem>
                      <SelectItem value="Chypre">Chypre</SelectItem>
                      <SelectItem value="Colombie">Colombie</SelectItem>
                      <SelectItem value="Comores">Comores</SelectItem>
                      <SelectItem value="Congo">Congo</SelectItem>
                      <SelectItem value="Congo (RDC)">Congo (RDC)</SelectItem>
                      <SelectItem value="Corée du Nord">Corée du Nord</SelectItem>
                      <SelectItem value="Corée du Sud">Corée du Sud</SelectItem>
                      <SelectItem value="Costa Rica">Costa Rica</SelectItem>
                      <SelectItem value="Côte d'Ivoire">Côte d'Ivoire</SelectItem>
                      <SelectItem value="Croatie">Croatie</SelectItem>
                      <SelectItem value="Cuba">Cuba</SelectItem>
                      <SelectItem value="Danemark">Danemark</SelectItem>
                      <SelectItem value="Djibouti">Djibouti</SelectItem>
                      <SelectItem value="Dominique">Dominique</SelectItem>
                      <SelectItem value="Égypte">Égypte</SelectItem>
                      <SelectItem value="Émirats arabes unis">Émirats arabes unis</SelectItem>
                      <SelectItem value="Équateur">Équateur</SelectItem>
                      <SelectItem value="Érythrée">Érythrée</SelectItem>
                      <SelectItem value="Espagne">Espagne</SelectItem>
                      <SelectItem value="Estonie">Estonie</SelectItem>
                      <SelectItem value="Eswatini">Eswatini</SelectItem>
                      <SelectItem value="États-Unis">États-Unis</SelectItem>
                      <SelectItem value="Éthiopie">Éthiopie</SelectItem>
                      <SelectItem value="Fidji">Fidji</SelectItem>
                      <SelectItem value="Finlande">Finlande</SelectItem>
                      <SelectItem value="France">France</SelectItem>
                      <SelectItem value="Gabon">Gabon</SelectItem>
                      <SelectItem value="Gambie">Gambie</SelectItem>
                      <SelectItem value="Géorgie">Géorgie</SelectItem>
                      <SelectItem value="Ghana">Ghana</SelectItem>
                      <SelectItem value="Grèce">Grèce</SelectItem>
                      <SelectItem value="Grenade">Grenade</SelectItem>
                      <SelectItem value="Guatemala">Guatemala</SelectItem>
                      <SelectItem value="Guinée">Guinée</SelectItem>
                      <SelectItem value="Guinée-Bissau">Guinée-Bissau</SelectItem>
                      <SelectItem value="Guinée équatoriale">Guinée équatoriale</SelectItem>
                      <SelectItem value="Guyana">Guyana</SelectItem>
                      <SelectItem value="Haïti">Haïti</SelectItem>
                      <SelectItem value="Honduras">Honduras</SelectItem>
                      <SelectItem value="Hongrie">Hongrie</SelectItem>
                      <SelectItem value="Îles Cook">Îles Cook</SelectItem>
                      <SelectItem value="Îles Marshall">Îles Marshall</SelectItem>
                      <SelectItem value="Îles Salomon">Îles Salomon</SelectItem>
                      <SelectItem value="Inde">Inde</SelectItem>
                      <SelectItem value="Indonésie">Indonésie</SelectItem>
                      <SelectItem value="Irak">Irak</SelectItem>
                      <SelectItem value="Iran">Iran</SelectItem>
                      <SelectItem value="Irlande">Irlande</SelectItem>
                      <SelectItem value="Islande">Islande</SelectItem>
                      <SelectItem value="Israël">Israël</SelectItem>
                      <SelectItem value="Italie">Italie</SelectItem>
                      <SelectItem value="Jamaïque">Jamaïque</SelectItem>
                      <SelectItem value="Japon">Japon</SelectItem>
                      <SelectItem value="Jordanie">Jordanie</SelectItem>
                      <SelectItem value="Kazakhstan">Kazakhstan</SelectItem>
                      <SelectItem value="Kenya">Kenya</SelectItem>
                      <SelectItem value="Kirghizistan">Kirghizistan</SelectItem>
                      <SelectItem value="Kiribati">Kiribati</SelectItem>
                      <SelectItem value="Koweït">Koweït</SelectItem>
                      <SelectItem value="Laos">Laos</SelectItem>
                      <SelectItem value="Lesotho">Lesotho</SelectItem>
                      <SelectItem value="Lettonie">Lettonie</SelectItem>
                      <SelectItem value="Liban">Liban</SelectItem>
                      <SelectItem value="Libéria">Libéria</SelectItem>
                      <SelectItem value="Libye">Libye</SelectItem>
                      <SelectItem value="Liechtenstein">Liechtenstein</SelectItem>
                      <SelectItem value="Lituanie">Lituanie</SelectItem>
                      <SelectItem value="Luxembourg">Luxembourg</SelectItem>
                      <SelectItem value="Macédoine du Nord">Macédoine du Nord</SelectItem>
                      <SelectItem value="Madagascar">Madagascar</SelectItem>
                      <SelectItem value="Malaisie">Malaisie</SelectItem>
                      <SelectItem value="Malawi">Malawi</SelectItem>
                      <SelectItem value="Maldives">Maldives</SelectItem>
                      <SelectItem value="Mali">Mali</SelectItem>
                      <SelectItem value="Malte">Malte</SelectItem>
                      <SelectItem value="Maroc">Maroc</SelectItem>
                      <SelectItem value="Maurice">Maurice</SelectItem>
                      <SelectItem value="Mauritanie">Mauritanie</SelectItem>
                      <SelectItem value="Mexique">Mexique</SelectItem>
                      <SelectItem value="Micronésie">Micronésie</SelectItem>
                      <SelectItem value="Moldavie">Moldavie</SelectItem>
                      <SelectItem value="Monaco">Monaco</SelectItem>
                      <SelectItem value="Mongolie">Mongolie</SelectItem>
                      <SelectItem value="Monténégro">Monténégro</SelectItem>
                      <SelectItem value="Mozambique">Mozambique</SelectItem>
                      <SelectItem value="Namibie">Namibie</SelectItem>
                      <SelectItem value="Nauru">Nauru</SelectItem>
                      <SelectItem value="Népal">Népal</SelectItem>
                      <SelectItem value="Nicaragua">Nicaragua</SelectItem>
                      <SelectItem value="Niger">Niger</SelectItem>
                      <SelectItem value="Nigéria">Nigéria</SelectItem>
                      <SelectItem value="Norvège">Norvège</SelectItem>
                      <SelectItem value="Nouvelle-Zélande">Nouvelle-Zélande</SelectItem>
                      <SelectItem value="Oman">Oman</SelectItem>
                      <SelectItem value="Ouganda">Ouganda</SelectItem>
                      <SelectItem value="Ouzbékistan">Ouzbékistan</SelectItem>
                      <SelectItem value="Pakistan">Pakistan</SelectItem>
                      <SelectItem value="Palaos">Palaos</SelectItem>
                      <SelectItem value="Palestine">Palestine</SelectItem>
                      <SelectItem value="Panama">Panama</SelectItem>
                      <SelectItem value="Papouasie-Nouvelle-Guinée">Papouasie-Nouvelle-Guinée</SelectItem>
                      <SelectItem value="Paraguay">Paraguay</SelectItem>
                      <SelectItem value="Pays-Bas">Pays-Bas</SelectItem>
                      <SelectItem value="Pérou">Pérou</SelectItem>
                      <SelectItem value="Philippines">Philippines</SelectItem>
                      <SelectItem value="Pologne">Pologne</SelectItem>
                      <SelectItem value="Portugal">Portugal</SelectItem>
                      <SelectItem value="Qatar">Qatar</SelectItem>
                      <SelectItem value="Roumanie">Roumanie</SelectItem>
                      <SelectItem value="Royaume-Uni">Royaume-Uni</SelectItem>
                      <SelectItem value="Russie">Russie</SelectItem>
                      <SelectItem value="Rwanda">Rwanda</SelectItem>
                      <SelectItem value="Saint-Christophe-et-Niévès">Saint-Christophe-et-Niévès</SelectItem>
                      <SelectItem value="Saint-Marin">Saint-Marin</SelectItem>
                      <SelectItem value="Saint-Vincent-et-les-Grenadines">Saint-Vincent-et-les-Grenadines</SelectItem>
                      <SelectItem value="Sainte-Lucie">Sainte-Lucie</SelectItem>
                      <SelectItem value="Salvador">Salvador</SelectItem>
                      <SelectItem value="Samoa">Samoa</SelectItem>
                      <SelectItem value="Sao Tomé-et-Principe">Sao Tomé-et-Principe</SelectItem>
                      <SelectItem value="Sénégal">Sénégal</SelectItem>
                      <SelectItem value="Serbie">Serbie</SelectItem>
                      <SelectItem value="Seychelles">Seychelles</SelectItem>
                      <SelectItem value="Sierra Leone">Sierra Leone</SelectItem>
                      <SelectItem value="Singapour">Singapour</SelectItem>
                      <SelectItem value="Slovaquie">Slovaquie</SelectItem>
                      <SelectItem value="Slovénie">Slovénie</SelectItem>
                      <SelectItem value="Somalie">Somalie</SelectItem>
                      <SelectItem value="Soudan">Soudan</SelectItem>
                      <SelectItem value="Soudan du Sud">Soudan du Sud</SelectItem>
                      <SelectItem value="Sri Lanka">Sri Lanka</SelectItem>
                      <SelectItem value="Suède">Suède</SelectItem>
                      <SelectItem value="Suisse">Suisse</SelectItem>
                      <SelectItem value="Suriname">Suriname</SelectItem>
                      <SelectItem value="Syrie">Syrie</SelectItem>
                      <SelectItem value="Tadjikistan">Tadjikistan</SelectItem>
                      <SelectItem value="Tanzanie">Tanzanie</SelectItem>
                      <SelectItem value="Tchad">Tchad</SelectItem>
                      <SelectItem value="Tchéquie">Tchéquie</SelectItem>
                      <SelectItem value="Thaïlande">Thaïlande</SelectItem>
                      <SelectItem value="Timor oriental">Timor oriental</SelectItem>
                      <SelectItem value="Togo">Togo</SelectItem>
                      <SelectItem value="Tonga">Tonga</SelectItem>
                      <SelectItem value="Trinité-et-Tobago">Trinité-et-Tobago</SelectItem>
                      <SelectItem value="Tunisie">Tunisie</SelectItem>
                      <SelectItem value="Turkménistan">Turkménistan</SelectItem>
                      <SelectItem value="Turquie">Turquie</SelectItem>
                      <SelectItem value="Tuvalu">Tuvalu</SelectItem>
                      <SelectItem value="Ukraine">Ukraine</SelectItem>
                      <SelectItem value="Uruguay">Uruguay</SelectItem>
                      <SelectItem value="Vanuatu">Vanuatu</SelectItem>
                      <SelectItem value="Vatican">Vatican</SelectItem>
                      <SelectItem value="Venezuela">Venezuela</SelectItem>
                      <SelectItem value="Viêt Nam">Viêt Nam</SelectItem>
                      <SelectItem value="Yémen">Yémen</SelectItem>
                      <SelectItem value="Zambie">Zambie</SelectItem>
                      <SelectItem value="Zimbabwe">Zimbabwe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                />
                {loading && <span className="text-sm text-muted-foreground">Chargement...</span>}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative group aspect-square rounded-lg overflow-hidden">
                    <img
                      src={image}
                      alt={`Image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleImageDelete(image)}
                      className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <XIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {images.length === 0 && (
                  <div className="aspect-square rounded-lg border-2 border-dashed border-muted flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 flex justify-end gap-4 mb-24 mr-28">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              Annuler
            </Button>
            <Button 
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Création...' : 'Créer la propriété'}
            </Button>
          </div>
        </form>
      </div>
    </>
  )
} 