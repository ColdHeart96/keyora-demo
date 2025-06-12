"use client"

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectItem, SelectTrigger, SelectContent, SelectValue } from "@/components/ui/select";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, LineChart, Line, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Home, Users, UserCheck, Clock, MapPin, BarChart3, PieChart as PieChartIcon } from "lucide-react";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { fr } from "date-fns/locale";

function normalize(str: string) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function isInSelectedPeriod(dateStr: string, range: string) {
  const date = new Date(dateStr);
  const now = new Date();
  if (range === "week") {
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay());
    return date >= start && date <= now;
  }
  if (range === "month") {
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }
  if (range === "quarter") {
    const quarter = Math.floor(now.getMonth() / 3);
    const start = new Date(now.getFullYear(), quarter * 3, 1);
    return date >= start && date <= now;
  }
  if (range === "year") {
    return date.getFullYear() === now.getFullYear();
  }
  return true;
}

const COLORS = ["#3B82F6", "#10B981", "#6366F1", "#F59E42", "#EF4444", "#A21CAF", "#FBBF24"];

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("month");
  const [selectedPropertyType, setSelectedPropertyType] = useState("all");
  const [properties, setProperties] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [prospects, setProspects] = useState<any[]>([]);
  const [visits, setVisits] = useState<any[]>([]);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      const { data: propertiesData } = await supabase.from("properties").select("*");
      const { data: prospectsData } = await supabase.from("prospects").select("*");
      const { data: visitsData } = await supabase.from("visits").select("*");
      const { data: clientsData } = await supabase.from("clients").select("*");
      setProperties(propertiesData || []);
      setProspects(prospectsData || []);
      setClients(clientsData || []);
      setVisits(visitsData || []);
      setLoading(false);
    };
    fetchAll();
  }, [supabase]);

  // --- DATA LOGIC (identique à l'existant, adapté pour le rendu) ---
  const filteredProperties = properties
    .filter((p) => selectedPropertyType === "all" || p.type === selectedPropertyType)
    .filter((p) => p.created_at && isInSelectedPeriod(p.created_at, timeRange));
  const filteredProspects = prospects
    .filter((p) => selectedPropertyType === "all" || p.property_type === selectedPropertyType)
    .filter((p) => p.created_at && isInSelectedPeriod(p.created_at, timeRange));
  const filteredClients = clients.filter((c) => c.created_at && isInSelectedPeriod(c.created_at, timeRange));
  const filteredVisits = visits.filter((v) => v.created_at && isInSelectedPeriod(v.created_at, timeRange));

  const totalProperties = filteredProperties.length;
  const activeClients = filteredClients.filter((c) => c.status === "active").length;
  const activeProspects = filteredProspects.filter((p) =>
    ["new", "contacted", "pending", "follow_up", "negotiation"].includes(p.status)
  ).length;
  const visitsThisMonth = filteredVisits.length;
  const convertedProspects = filteredProspects.filter((p) => p.status === "converted").length;
  const conversionRate = filteredProspects.length ? (convertedProspects / filteredProspects.length) * 100 : 0;
  const soldProperties = filteredProperties.filter((p) => p.status === "sold");
  const averageSaleTime =
    soldProperties.length > 0
      ? soldProperties.reduce((acc, p) => {
          const listingDate = new Date(p.created_at);
          const saleDate = new Date(p.updated_at);
          return acc + (saleDate.getTime() - listingDate.getTime()) / (1000 * 60 * 60 * 24);
        }, 0) / soldProperties.length
      : 0;

  // Graphiques
  const monthlyVisits = Array.from({ length: 12 }, (_, i) => {
    const date = subMonths(new Date(), i);
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    const count =
      filteredVisits.filter((v) => {
        const visitDate = new Date(v.date);
        return visitDate >= monthStart && visitDate <= monthEnd;
      }).length || 0;
    return {
      date: format(date, "MMM yyyy", { locale: fr }),
      count,
    };
  }).reverse();

  const monthlyProperties = Array.from({ length: 12 }, (_, i) => {
    const date = subMonths(new Date(), i);
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    const count =
      filteredProperties.filter((p) => {
        const propertyDate = new Date(p.created_at);
        return propertyDate >= monthStart && propertyDate <= monthEnd;
      }).length || 0;
    return {
      date: format(date, "MMM yyyy", { locale: fr }),
      count,
    };
  }).reverse();

  const conversionFunnel = [
    { name: "Prospects contactés", value: filteredProspects?.filter((p) => p.status !== "new").length || 0 },
    { name: "Rendez-vous", value: filteredVisits?.length || 0 },
    { name: "En négociation", value: filteredProspects?.filter((p) => p.status === "negotiation").length || 0 },
    { name: "Closés", value: filteredProspects?.filter((p) => p.status === "converted").length || 0 },
  ];

  const propertyTypes = Object.entries(
    filteredProperties.reduce((acc, p) => {
      acc[p.type] = (acc[p.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  const propertyStatus = Object.entries(
    filteredProperties.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  const priceByNeighborhood = Object.entries(
    filteredProperties.reduce((acc, p) => {
      if (p.price && p.area) {
        const pricePerM2 = p.price / p.area;
        acc[p.neighborhood] = (acc[p.neighborhood] || 0) + pricePerM2;
      }
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value: Math.round(Number(value)) }));

  // Nouveaux indicateurs
  const topNeighborhoods = priceByNeighborhood.slice().sort((a, b) => b.value - a.value).slice(0, 3);
  const clientRetention = clients.length
    ? Math.round(
        (clients.filter((c: any) => c.nb_transactions && c.nb_transactions > 1).length / clients.length) * 100
      )
    : 0;
  const avgContactToConversion = (() => {
    const converted = prospects.filter((p: any) => p.status === "converted" && p.created_at && p.updated_at);
    if (!converted.length) return 0;
    const total = converted.reduce((acc: number, p: any) => {
      const start = new Date(p.created_at).getTime();
      const end = new Date(p.updated_at).getTime();
      return acc + (end - start) / (1000 * 60 * 60 * 24);
    }, 0);
    return Math.round(total / converted.length);
  })();
  const conversionByType = (() => {
    const types = Array.from(new Set(properties.map((p: any) => p.type)));
    return types.map((type) => {
      const total = properties.filter((p: any) => p.type === type).length;
      const sold = properties.filter((p: any) => p.type === type && p.status === "sold").length;
      return { name: type, value: total ? Math.round((sold / total) * 100) : 0 };
    });
  })();

  // Tableaux pays/villes
  const countryList = Array.from(new Set(properties.map((p) => p.country).filter(Boolean)));
  const cityList = Array.from(new Set(properties.map((p) => p.city).filter(Boolean)));

  if (loading) {
    return (
      <>
        <Navbar title="Analytique" />
        <div className="flex flex-col items-center justify-center h-96">
          <svg className="animate-spin h-10 w-10 text-primary mb-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          <div className="text-lg text-muted-foreground">Chargement des analyses...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar title="Analytique" />
      <div className="min-h-screen bg-background dark:bg-[#101014] p-4 md:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <PieChartIcon className="w-8 h-8 text-primary" />
            Analytique
          </h1>
          <div className="text-muted-foreground text-base mt-2">
            Visualisez l’évolution de votre activité, vos KPIs et vos données clés en temps réel.
          </div>
        </div>

        {/* Filtres */}
        <div className="sticky top-0 z-30 bg-card/80 dark:bg-card/80 backdrop-blur border-b border-border rounded-xl shadow-lg flex flex-wrap gap-6 items-end px-4 py-4 mb-10">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground mb-1">Période</label>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Choisir une période" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Cette semaine</SelectItem>
                  <SelectItem value="month">Ce mois</SelectItem>
                  <SelectItem value="quarter">Ce trimestre</SelectItem>
                  <SelectItem value="year">Cette année</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground mb-1">Type de bien</label>
            <div className="flex items-center gap-2">
              <Home className="w-5 h-5 text-primary" />
              <Select value={selectedPropertyType} onValueChange={setSelectedPropertyType}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Type de bien..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="house">Maison</SelectItem>
                  <SelectItem value="apartment">Appartement</SelectItem>
                  <SelectItem value="land">Terrain</SelectItem>
                  <SelectItem value="commercial">Local commercial</SelectItem>
                  <SelectItem value="parking">Parking</SelectItem>
                  <SelectItem value="villa">Villa</SelectItem>
                  <SelectItem value="other">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
          <Card className="rounded-xl shadow-md transition hover:scale-[1.02] bg-card text-card-foreground">
            <CardContent className="flex flex-col items-center py-4">
              <Home className="h-6 w-6 text-blue-500 mb-1" />
              <div className="text-lg font-semibold">{totalProperties}</div>
              <div className="text-xs text-muted-foreground">Biens enregistrés</div>
            </CardContent>
          </Card>
          <Card className="rounded-xl shadow-md transition hover:scale-[1.02] bg-card text-card-foreground">
            <CardContent className="flex flex-col items-center py-4">
              <UserCheck className="h-6 w-6 text-green-500 mb-1" />
              <div className="text-lg font-semibold">{activeClients}</div>
              <div className="text-xs text-muted-foreground">Clients actifs</div>
            </CardContent>
          </Card>
          <Card className="rounded-xl shadow-md transition hover:scale-[1.02] bg-card text-card-foreground">
            <CardContent className="flex flex-col items-center py-4">
              <Users className="h-6 w-6 text-yellow-500 mb-1" />
              <div className="text-lg font-semibold">{activeProspects}</div>
              <div className="text-xs text-muted-foreground">Prospects en cours</div>
            </CardContent>
          </Card>
          <Card className="rounded-xl shadow-md transition hover:scale-[1.02] bg-card text-card-foreground">
            <CardContent className="flex flex-col items-center py-4">
              <TrendingUp className="h-6 w-6 text-indigo-500 mb-1" />
              <div className="text-lg font-semibold">{visitsThisMonth}</div>
              <div className="text-xs text-muted-foreground">Visites ce mois</div>
            </CardContent>
          </Card>
          <Card className="rounded-xl shadow-md transition hover:scale-[1.02] bg-card text-card-foreground">
            <CardContent className="flex flex-col items-center py-4">
              <PieChartIcon className="h-6 w-6 text-pink-500 mb-1" />
              <div className="text-lg font-semibold">{conversionRate.toFixed(1)}%</div>
              <div className="text-xs text-muted-foreground">Taux de conversion</div>
            </CardContent>
          </Card>
          <Card className="rounded-xl shadow-md transition hover:scale-[1.02] bg-card text-card-foreground">
            <CardContent className="flex flex-col items-center py-4">
              <Clock className="h-6 w-6 text-gray-500 mb-1" />
              <div className="text-lg font-semibold">{Math.round(averageSaleTime)} jours</div>
              <div className="text-xs text-muted-foreground">Délai moyen de vente</div>
            </CardContent>
          </Card>
        </div>

        {/* Indicateurs complémentaires */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="rounded-xl shadow-md bg-card text-card-foreground">
            <CardHeader className="pb-2 flex flex-row items-center gap-2">
              <MapPin className="w-5 h-5 text-orange-500" />
              <CardTitle className="text-base">Top quartiers €/m²</CardTitle>
            </CardHeader>
            <CardContent>
              {topNeighborhoods.map((q) => (
                <div key={q.name} className="flex items-center gap-2 text-sm">
                  <span className="font-semibold">{q.name}</span>
                  <span className="ml-2 text-orange-700">{q.value} €/m²</span>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="rounded-xl shadow-md bg-card text-card-foreground">
            <CardHeader className="pb-2 flex flex-row items-center gap-2">
              <Users className="w-5 h-5 text-teal-500" />
              <CardTitle className="text-base">Taux de rétention</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clientRetention}%</div>
            </CardContent>
          </Card>
          <Card className="rounded-xl shadow-md bg-card text-card-foreground">
            <CardHeader className="pb-2 flex flex-row items-center gap-2">
              <Clock className="w-5 h-5 text-red-500" />
              <CardTitle className="text-base">Délai moyen conversion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgContactToConversion} jours</div>
            </CardContent>
          </Card>
          <Card className="rounded-xl shadow-md bg-card text-card-foreground">
            <CardHeader className="pb-2 flex flex-row items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-sky-500" />
              <CardTitle className="text-base">Taux de transformation par type de bien</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                {conversionByType.map((t) => (
                  <div key={t.name} className="flex items-center gap-2 text-sm">
                    <span className="font-semibold">{t.name}</span>
                    <span className="ml-2 text-sky-700">{t.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Onglets graphiques */}
        <div className="mb-8">
          <div className="flex gap-2 mb-4">
            {/* Onglets custom, tu peux remplacer par un composant Tab shadcn/ui si tu en as un */}
            {/* Ici, on affiche tout en colonne pour l'exemple */}
            <Badge variant="secondary">Activité</Badge>
            <Badge variant="secondary">Pipeline</Badge>
            <Badge variant="secondary">Biens</Badge>
            <Badge variant="secondary">Pays</Badge>
            <Badge variant="secondary">Ville</Badge>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Activité */}
            <Card className="rounded-xl shadow-md bg-card text-card-foreground">
              <CardHeader>
                <CardTitle>Visites mensuelles</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyVisits}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="rounded-xl shadow-md bg-card text-card-foreground">
              <CardHeader>
                <CardTitle>Nouvelles propriétés</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyProperties}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Pipeline */}
            <Card className="rounded-xl shadow-md bg-card text-card-foreground">
              <CardHeader>
                <CardTitle>Funnel de conversion</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={conversionFunnel}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#6366F1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            {/* Types de biens */}
            <Card className="rounded-xl shadow-md bg-card text-card-foreground">
              <CardHeader>
                <CardTitle>Types de biens</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={propertyTypes} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                      {propertyTypes.map((entry, i) => (
                        <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Statut des biens */}
            <Card className="rounded-xl shadow-md bg-card text-card-foreground">
              <CardHeader>
                <CardTitle>Statut des biens</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={propertyStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                      {propertyStatus.map((entry, i) => (
                        <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            {/* Prix moyen au m² */}
            <Card className="rounded-xl shadow-md bg-card text-card-foreground">
              <CardHeader>
                <CardTitle>Prix moyen au m²</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={priceByNeighborhood}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            {/* Radar activité par type */}
            <Card className="rounded-xl shadow-md bg-card text-card-foreground">
              <CardHeader>
                <CardTitle>Activité par type</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={[
                    { type: "Biens", value: totalProperties },
                    { type: "Clients", value: activeClients },
                    { type: "Prospects", value: activeProspects },
                    { type: "Visites", value: visitsThisMonth },
                  ]} outerRadius={80}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="type" />
                    <PolarRadiusAxis angle={30} domain={[0, Math.max(totalProperties, activeClients, activeProspects, visitsThisMonth, 1)]} />
                    <Radar name="Activité" dataKey="value" stroke="#6366F1" fill="#6366F1" fillOpacity={0.4} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tableaux pays/villes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Pays */}
          <Card className="rounded-xl shadow-md bg-card text-card-foreground">
            <CardHeader>
              <CardTitle>Par pays</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pays</TableHead>
                    <TableHead>Biens</TableHead>
                    <TableHead>Clients</TableHead>
                    <TableHead>Prospects</TableHead>
                    <TableHead>Visites</TableHead>
                    <TableHead>Taux de conversion</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {countryList.map((country) => {
                    const props = properties
                      .filter((p) => p.country === country)
                      .filter((p) => selectedPropertyType === "all" || p.type === selectedPropertyType)
                      .filter((p) => p.created_at && isInSelectedPeriod(p.created_at, timeRange));
                    const clis = clients
                      .filter((c) => c.country === country)
                      .filter((c) => c.created_at && isInSelectedPeriod(c.created_at, timeRange));
                    const pros = prospects
                      .filter((p) => p.country === country)
                      .filter((p) => selectedPropertyType === "all" || p.property_type === selectedPropertyType)
                      .filter((p) => p.created_at && isInSelectedPeriod(p.created_at, timeRange));
                    const vis = visits
                      .filter((v) => v.country === country)
                      .filter((v) => v.created_at && isInSelectedPeriod(v.created_at, timeRange));
                    const conversion = pros.length ? (pros.filter((p) => p.status === "converted").length / pros.length) * 100 : 0;
                    return (
                      <TableRow key={country}>
                        <TableCell className="font-medium">{country}</TableCell>
                        <TableCell>{props.length}</TableCell>
                        <TableCell>{clis.length}</TableCell>
                        <TableCell>{pros.length}</TableCell>
                        <TableCell>{vis.length}</TableCell>
                        <TableCell>{conversion.toFixed(1)}%</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          {/* Villes */}
          <Card className="rounded-xl shadow-md bg-card text-card-foreground">
            <CardHeader>
              <CardTitle>Par ville</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ville</TableHead>
                    <TableHead>Biens</TableHead>
                    <TableHead>Clients</TableHead>
                    <TableHead>Prospects</TableHead>
                    <TableHead>Visites</TableHead>
                    <TableHead>Taux de conversion</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cityList.map((city) => {
                    const props = properties
                      .filter((p) => p.city === city)
                      .filter((p) => selectedPropertyType === "all" || p.type === selectedPropertyType)
                      .filter((p) => p.created_at && isInSelectedPeriod(p.created_at, timeRange));
                    const clis = clients
                      .filter((c) => c.city === city)
                      .filter((c) => c.created_at && isInSelectedPeriod(c.created_at, timeRange));
                    const pros = prospects
                      .filter((p) => p.city === city)
                      .filter((p) => selectedPropertyType === "all" || p.property_type === selectedPropertyType)
                      .filter((p) => p.created_at && isInSelectedPeriod(p.created_at, timeRange));
                    const vis = visits
                      .filter((v) => v.city === city)
                      .filter((v) => v.created_at && isInSelectedPeriod(v.created_at, timeRange));
                    const conversion = pros.length ? (pros.filter((p) => p.status === "converted").length / pros.length) * 100 : 0;
                    return (
                      <TableRow key={city}>
                        <TableCell className="font-medium">{city}</TableCell>
                        <TableCell>{props.length}</TableCell>
                        <TableCell>{clis.length}</TableCell>
                        <TableCell>{pros.length}</TableCell>
                        <TableCell>{vis.length}</TableCell>
                        <TableCell>{conversion.toFixed(1)}%</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}