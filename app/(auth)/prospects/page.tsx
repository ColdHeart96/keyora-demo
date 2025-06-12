'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserPlus, UserCheck, Mail, Phone, Activity, ArrowUpRight, ArrowDownRight, Plus, BadgeEuro, MapPin, StickyNote, Trash } from 'lucide-react'
import Link from "next/link"
import { cn } from "@/lib/utils"
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

export default function ProspectsPage() {
  const { user } = useUser()
  const [prospects, setProspects] = useState<any[]>([])
  const [stats, setStats] = useState({
    total: 0,
    newProspects: 0,
    active: 0
  })
  const supabase = createClientComponentClient()
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
  const [prospectToDelete, setProspectToDelete] = useState<any>(null)

  useEffect(() => {
    if (user) {
      const loadProspects = async () => {
        const { data, error } = await supabase
          .from('prospects')
          .select('*')
          .eq('user_id', user.id)

        if (error) {
          console.error('Erreur lors du chargement des prospects:', error)
          return
        }
        setProspects(data || [])
        setStats({
          total: data?.length || 0,
          newProspects: (data || []).filter((p: any) => {
            if (!p.created_at) return false
            const created = new Date(p.created_at)
            const now = new Date()
            const diff = (now.getTime() - created.getTime()) / (1000 * 3600 * 24)
            return diff <= 30
          }).length,
          active: (data || []).filter((p: any) => p.status === 'active').length
        })
      }
      loadProspects()
    }
  }, [user, supabase])

  const stats_cards = [
    {
      title: "Total Prospects",
      value: stats.total,
      description: "Base totale",
      icon: Users,
      trend: "+5.2%",
      trendUp: true,
      color: "blue"
    },
    {
      title: "Nouveaux Prospects",
      value: stats.newProspects,
      description: "30 derniers jours",
      icon: UserPlus,
      trend: "+2.1%",
      trendUp: true,
      color: "green"
    },
    {
      title: "Prospects Actifs",
      value: stats.active,
      description: "En recherche active",
      icon: UserCheck,
      trend: "+1.7%",
      trendUp: true,
      color: "purple"
    }
  ]

  return (
    <div className="flex flex-col px-4 py-8 min-h-screen dark:bg-black">
      <div className="flex items-center justify-between space-y-2 pb-10">
        <div className="space-y-0.5">
          <h1 className="text-3xl font-bold tracking-tight text-card-foreground">Prospects</h1>
          <p className="text-muted-foreground">
            Gérez vos prospects et leurs informations
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Link href="/prospects/new">
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nouveau prospect
            </button>
          </Link>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
        {stats_cards.map((stat, index) => (
          <div key={index} className="relative overflow-hidden border-0 dark:bg-[#1a1a1a] rounded-2xl shadow-md">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2 px-6 pt-6">
              <span className="text-sm font-medium text-card-foreground">
                {stat.title}
              </span>
              <div className="p-2 rounded-full dark:bg-black/40">
                <stat.icon className="h-4 w-4 text-card-foreground" />
              </div>
            </div>
            <div className="px-6 pb-6">
              <div className="flex items-center space-x-2">
                <div className="text-2xl font-bold text-card-foreground">{stat.value}</div>
                <span
                  className={`flex items-center text-xs ${
                    stat.trendUp ? 'text-emerald-500' : 'text-red-500'
                  }`}
                >
                  {stat.trend}
                  {stat.trendUp ? (
                    <ArrowUpRight className="h-4 w-4" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4" />
                  )}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </div>
            <div
              className={`absolute bottom-0 left-0 h-0.5 w-full dark:bg-white/10`}
            />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {prospects.length === 0 && (
          <div className="col-span-full text-center text-muted-foreground">Aucun prospect trouvé.</div>
        )}
        {prospects.map((prospect) => (
          <Card key={prospect.id} className="w-full max-w-md mx-auto">
            <div className="flex justify-between items-start px-3 pt-3">
              <div />
              <div className="flex gap-1">
                <Link href={`/prospects/${prospect.id}`} title="Détails">
                  <button className="p-1.5 rounded hover:bg-accent transition-colors" aria-label="Détails">
                    <Activity className="h-4 w-4 text-muted-foreground hover:text-primary" />
                  </button>
                </Link>
                <Link href={`/prospects/${prospect.id}/edit`} title="Modifier">
                  <button className="p-1.5 rounded hover:bg-accent transition-colors" aria-label="Modifier">
                    <UserPlus className="h-4 w-4 text-blue-400 hover:text-blue-600" />
                  </button>
                </Link>
                <button
                  className="p-1.5 rounded hover:bg-accent transition-colors"
                  aria-label="Supprimer"
                  onClick={() => {
                    setProspectToDelete(prospect)
                    setOpenConfirmDialog(true)
                  }}
                >
                  <Trash className="h-4 w-4 text-red-400 hover:text-red-600" />
                </button>
              </div>
            </div>
            <CardHeader className="pb-1 pt-0 flex flex-row items-center gap-2 px-3">
              <UserCheck className="h-6 w-6 text-blue-500" />
              <div>
                <CardTitle className="text-base font-bold text-card-foreground leading-tight">
                  {prospect.first_name || prospect.last_name
                    ? `${prospect.first_name || ''} ${prospect.last_name || ''}`.trim()
                    : prospect.email}
                </CardTitle>
                <div className="text-xs text-muted-foreground font-normal mt-0.5">Prospect #{prospect.id?.slice(0, 8)}</div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-1.5 pb-2 px-3">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Mail className="h-4 w-4" />
                <span className="text-card-foreground font-medium truncate">{prospect.email || '—'}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Phone className="h-4 w-4" />
                <span className="text-card-foreground font-medium truncate">{prospect.phone || '—'}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <BadgeEuro className="h-4 w-4" />
                <span>Budget :</span>
                <span className="text-card-foreground font-semibold">{prospect.budget_min ? `${prospect.budget_min} €` : '—'}{prospect.budget_max ? ` - ${prospect.budget_max} €` : ''}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <MapPin className="h-4 w-4" />
                <span>Quartiers/Villes souhaités :</span>
                <span className="text-card-foreground font-medium truncate">{prospect.desired_locations && prospect.desired_locations.length > 0 ? prospect.desired_locations.join(', ') : '—'}</span>
              </div>
              {prospect.notes && (
                <div className="flex items-start gap-2 text-muted-foreground text-sm">
                  <StickyNote className="h-4 w-4 mt-0.5" />
                  <span className="whitespace-pre-line text-card-foreground font-medium">{prospect.notes}</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      <ConfirmDialog
        isOpen={openConfirmDialog}
        onClose={() => setOpenConfirmDialog(false)}
        onConfirm={async () => {
          if (prospectToDelete) {
            const { error } = await supabase.from('prospects').delete().eq('id', prospectToDelete.id)
            if (error) {
              alert("Erreur lors de la suppression du prospect : " + (error.message || ""))
              console.error(error)
              return
            }
            setProspects((prev) => prev.filter((p) => p.id !== prospectToDelete.id))
            setProspectToDelete(null)
          }
        }}
        title="Confirmer la suppression"
        message={`Êtes-vous sûr de vouloir supprimer le prospect "${prospectToDelete?.first_name || ''} ${prospectToDelete?.last_name || ''}" ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
      />
    </div>
  )
} 