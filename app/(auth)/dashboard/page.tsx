"use client";
import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Navbar } from '@/components/navbar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, HomeIcon, UserCheck, CalendarIcon, TrendingUp, PieChart as PieChartIcon, CheckCircle, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';

const COLORS = ["#3B82F6", "#10B981", "#6366F1", "#F59E42", "#EF4444", "#A21CAF", "#FBBF24"];

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [prospects, setProspects] = useState<any[]>([]);
  const [visits, setVisits] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const supabase = createClientComponentClient();

  // Rafraîchissement automatique toutes les 10s
  useEffect(() => {
    let interval: NodeJS.Timeout;
    const fetchAll = async () => {
      setLoading(true);
      const { data: propertiesData } = await supabase.from('properties').select('*');
      const { data: clientsData } = await supabase.from('clients').select('*');
      const { data: prospectsData } = await supabase.from('prospects').select('*');
      const { data: visitsData } = await supabase.from('visits').select('*');
      const { data: tasksData } = await supabase.from('tasks').select('*');
      setProperties(propertiesData || []);
      setClients(clientsData || []);
      setProspects(prospectsData || []);
      setVisits(visitsData || []);
      setTasks(tasksData || []);
      setLoading(false);
    };
    fetchAll();
  }, [supabase]);

  // --- BIENS ---
  const biensStats = {
    total: properties.length,
    forSale: properties.filter((p: any) => p.status === 'available').length,
    forRent: properties.filter((p: any) => p.status === 'rented').length,
    sold: properties.filter((p: any) => p.status === 'sold').length,
    totalValue: properties.reduce((sum: number, p: any) => sum + (p.price || 0), 0),
  };
  const biensPieData = [
    { name: 'À vendre', value: biensStats.forSale },
    { name: 'En location', value: biensStats.forRent },
    { name: 'Vendus', value: biensStats.sold },
  ];
  const lastProperties = [...properties].sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 3);

  // --- CLIENTS ---
  const clientsStats = {
    total: clients.length,
    newClients: clients.filter((c: any) => {
      if (!c.created_at) return false;
      const created = new Date(c.created_at);
      const now = new Date();
      return (now.getTime() - created.getTime()) / (1000 * 3600 * 24) <= 30;
    }).length,
    active: clients.filter((c: any) => c.status === 'active').length,
  };
  const lastClients = [...clients].sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 3);

  // --- PROSPECTS ---
  const prospectsStats = {
    total: prospects.length,
    newProspects: prospects.filter((p: any) => {
      if (!p.created_at) return false;
      const created = new Date(p.created_at);
      const now = new Date();
      return (now.getTime() - created.getTime()) / (1000 * 3600 * 24) <= 30;
    }).length,
    active: prospects.filter((p: any) => p.status === 'active').length,
    converted: prospects.filter((p: any) => p.status === 'converted').length,
  };
  const lastProspects = [...prospects].sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 3);
  // Evolution prospects par mois (6 derniers mois)
  const months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i));
    return date.toLocaleString('fr-FR', { month: 'short' });
  });
  const prospectsByMonth = months.map((month, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i));
    return {
      month,
      count: prospects.filter((p: any) => {
        const d = new Date(p.created_at);
        return d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear();
      }).length,
    };
  });

  // --- VISITES ---
  const visitsStats = {
    total: visits.length,
    upcoming: visits.filter((v: any) => new Date(v.date) >= new Date()).length,
    done: visits.filter((v: any) => v.status === 'realisee').length,
  };
  // Visites par mois (6 derniers mois)
  const visitsByMonth = months.map((month, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i));
    return {
      month,
      count: visits.filter((v: any) => {
        const d = new Date(v.date);
        return d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear();
      }).length,
    };
  });
  const nextVisits = [...visits].filter((v: any) => new Date(v.date) >= new Date()).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 3);

  // --- TÂCHES ---
  const tasksStats = {
    todo: tasks.filter((t: any) => t.status !== 'done').length,
    overdue: tasks.filter((t: any) => t.status !== 'done' && t.due_date && new Date(t.due_date) < new Date()).length,
    done: tasks.filter((t: any) => t.status === 'done').length,
  };
  const nextTasks = [...tasks].filter((t: any) => t.status !== 'done').sort((a: any, b: any) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()).slice(0, 3);

  // --- CRM PIPELINE ---
  const pipeline = prospects.reduce<Record<string, any[]>>((acc, p) => {
    const status = p.status || 'new';
    if (!acc[status]) acc[status] = [];
    acc[status].push(p);
    return acc;
  }, {});
  const pipelineData = Object.entries(pipeline).map(([status, arr]) => ({ status, count: arr.length }));
  const toFollow = prospects.filter((p: any) => p.status === 'follow_up').slice(0, 3);

  // --- ANALYTIQUE ---
  const conversionRate = prospectsStats.total ? (prospectsStats.converted / prospectsStats.total) * 100 : 0;
  const avgPropertyValue = biensStats.total ? (biensStats.totalValue / biensStats.total) : 0;

  // --- ACTIVITÉ RÉCENTE ---
  const recentActions = [
    ...properties.map((p: any) => ({
      type: 'Bien',
      label: p.title,
      date: p.created_at,
      id: p.id,
      icon: <HomeIcon className="h-4 w-4 text-blue-500" />
    })),
    ...clients.map((c: any) => ({
      type: 'Client',
      label: c.first_name + ' ' + c.last_name,
      date: c.created_at,
      id: c.id,
      icon: <Users className="h-4 w-4 text-green-500" />
    })),
    ...prospects.map((p: any) => ({
      type: 'Prospect',
      label: p.first_name + ' ' + p.last_name,
      date: p.created_at,
      id: p.id,
      icon: <UserCheck className="h-4 w-4 text-yellow-500" />
    })),
    ...visits.map((v: any) => ({
      type: 'Visite',
      label: v.title || v.id,
      date: v.created_at || v.date,
      id: v.id,
      icon: <CalendarIcon className="h-4 w-4 text-indigo-500" />
    })),
    ...tasks.map((t: any) => ({
      type: 'Tâche',
      label: t.title,
      date: t.created_at || t.due_date,
      id: t.id,
      icon: <CheckCircle className="h-4 w-4 text-pink-500" />
    })),
  ].filter(a => a.date).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);

  // --- RADAR DATA (activité par type) ---
  const radarData = [
    { type: 'Biens', value: biensStats.total },
    { type: 'Clients', value: clientsStats.total },
    { type: 'Prospects', value: prospectsStats.total },
    { type: 'Visites', value: visitsStats.total },
    { type: 'Tâches', value: tasksStats.todo },
  ];

  // --- Jauge (progression tâches) ---
  const gaugeValue = tasksStats.done + tasksStats.todo > 0 ? (tasksStats.done / (tasksStats.done + tasksStats.todo)) * 100 : 0;

  if (loading) return <div className="p-8">Chargement du tableau de bord...</div>;

  return (
    <>
      <Navbar title="Tableau de bord" />
      <div className="flex-1 space-y-8 p-6 pt-4 bg-background max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <div className="text-muted-foreground text-sm">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
          </div>
          <div className="flex items-center gap-2">
            <input type="text" placeholder="Recherche..." className="rounded-lg border px-3 py-1.5 text-sm bg-card text-card-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
      </div>
      
        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-4">
          <Card className="rounded-xl shadow-sm">
            <CardContent className="flex flex-col items-center py-4">
              <HomeIcon className="h-6 w-6 text-blue-500 mb-1" />
              <div className="text-lg font-semibold">{biensStats.total}</div>
              <div className="text-xs text-muted-foreground">Biens</div>
            </CardContent>
          </Card>
          <Card className="rounded-xl shadow-sm">
            <CardContent className="flex flex-col items-center py-4">
              <Users className="h-6 w-6 text-green-500 mb-1" />
              <div className="text-lg font-semibold">{clientsStats.total}</div>
              <div className="text-xs text-muted-foreground">Clients</div>
            </CardContent>
          </Card>
          <Card className="rounded-xl shadow-sm">
            <CardContent className="flex flex-col items-center py-4">
              <UserCheck className="h-6 w-6 text-yellow-500 mb-1" />
              <div className="text-lg font-semibold">{prospectsStats.total}</div>
              <div className="text-xs text-muted-foreground">Prospects</div>
            </CardContent>
          </Card>
          <Card className="rounded-xl shadow-sm">
            <CardContent className="flex flex-col items-center py-4">
              <CalendarIcon className="h-6 w-6 text-indigo-500 mb-1" />
              <div className="text-lg font-semibold">{visitsStats.total}</div>
              <div className="text-xs text-muted-foreground">Visites</div>
            </CardContent>
          </Card>
          <Card className="rounded-xl shadow-sm">
            <CardContent className="flex flex-col items-center py-4">
              <CheckCircle className="h-6 w-6 text-pink-500 mb-1" />
              <div className="text-lg font-semibold">{tasksStats.todo}</div>
              <div className="text-xs text-muted-foreground">Tâches à faire</div>
            </CardContent>
          </Card>
          <Card className="rounded-xl shadow-sm">
            <CardContent className="flex flex-col items-center py-4">
              <TrendingUp className="h-6 w-6 text-gray-500 mb-1" />
              <div className="text-lg font-semibold">{conversionRate.toFixed(1)}%</div>
              <div className="text-xs text-muted-foreground">Taux conversion</div>
            </CardContent>
          </Card>
              </div>

        {/* GRILLE PRINCIPALE */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-4">
          {/* Graphe principal (courbe activité prospects) */}
          <Card className="col-span-2 rounded-xl shadow-sm">
            <CardHeader><CardTitle>Évolution prospects (6 mois)</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={prospectsByMonth} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          {/* Radar activité */}
          <Card className="rounded-xl shadow-sm">
            <CardHeader><CardTitle>Activité par type</CardTitle></CardHeader>
          <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={radarData} outerRadius={80}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="type" />
                  <PolarRadiusAxis angle={30} domain={[0, Math.max(...radarData.map(d => d.value), 1)]} />
                  <Radar name="Activité" dataKey="value" stroke="#6366F1" fill="#6366F1" fillOpacity={0.4} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

        {/* Mini-graphes et stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
          {/* Pie biens */}
          <Card className="rounded-xl shadow-sm">
            <CardHeader><CardTitle>Répartition biens</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={biensPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={50} label>{biensPieData.map((entry, i) => <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />)}</Pie>
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          {/* Barres visites */}
          <Card className="rounded-xl shadow-sm">
            <CardHeader><CardTitle>Visites (6 mois)</CardTitle></CardHeader>
          <CardContent>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={visitsByMonth}>
                  <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
          </CardContent>
        </Card>
          {/* Jauge progression tâches */}
          <Card className="rounded-xl shadow-sm">
            <CardHeader><CardTitle>Progression tâches</CardTitle></CardHeader>
          <CardContent>
              <div className="flex flex-col items-center justify-center h-[140px]">
                <svg width="100" height="100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="10" />
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#3B82F6" strokeWidth="10" strokeDasharray={`${gaugeValue * 2.83} ${(100 - gaugeValue) * 2.83}`} strokeDashoffset="0" strokeLinecap="round" />
                  <text x="50" y="55" textAnchor="middle" fontSize="22" fill="#3B82F6" fontWeight="bold">{Math.round(gaugeValue)}%</text>
                </svg>
                <div className="text-xs text-muted-foreground mt-2">Tâches terminées</div>
              </div>
            </CardContent>
          </Card>
          {/* Pipeline CRM (barres horizontales) */}
          <Card className="rounded-xl shadow-sm">
            <CardHeader><CardTitle>Pipeline CRM</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={pipelineData} layout="vertical">
                  <XAxis type="number" />
                  <YAxis dataKey="status" type="category" />
                  <Tooltip />
                  <Bar dataKey="count" fill="#6366F1" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
                </div>

        {/* Activité récente (timeline) */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Activité récente</h2>
          <Card className="rounded-xl shadow-sm">
            <CardContent className="py-4">
              {recentActions.length === 0 ? (
                <div className="text-gray-400 text-sm">Aucune activité récente</div>
              ) : (
                <ul className="divide-y divide-border">
                  {recentActions.map((action, i) => (
                    <li key={action.id + action.type + i} className="flex items-center gap-3 py-2">
                      {action.icon}
                      <span className="font-medium text-card-foreground">{action.label}</span>
                      <span className="text-xs text-muted-foreground ml-2">{action.type}</span>
                      <span className="ml-auto text-xs text-muted-foreground">{action.date ? new Date(action.date).toLocaleString('fr-FR') : ''}</span>
                    </li>
                  ))}
                </ul>
              )}
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
} 
