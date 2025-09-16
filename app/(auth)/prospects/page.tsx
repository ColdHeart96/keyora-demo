'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, UserPlus, UserCheck, Mail, Phone, Activity, ArrowUpRight, ArrowDownRight, Plus, BadgeEuro, MapPin, StickyNote, Trash } from 'lucide-react'
import Link from "next/link"
import { cn } from "@/lib/utils"
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Navbar } from "@/components/navbar"

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
    <>
      <Navbar 
        title="Prospects" 
        description="Gérez vos prospects et leurs informations"
      >
        <Link href="/prospects/new">
          <Button variant="default" size="lg" className="bg-blue-600 hover:bg-blue-700 text-white shadow-medium">
            <Plus className="mr-2 h-5 w-5" />
            Nouveau prospect
          </Button>
        </Link>
      </Navbar>
      <div className="flex-1 space-y-6 p-6 pt-4 bg-background max-w-7xl mx-auto">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        {stats_cards.map((stat, index) => (
          <Card 
            key={index} 
            variant="modern" 
            className="animate-slide-in-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20">
                <stat.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3">
                <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                <span
                  className={cn(
                    "flex items-center text-sm font-medium px-2 py-1 rounded-lg",
                    stat.trendUp 
                      ? 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20' 
                      : 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20'
                  )}
                >
                  {stat.trend}
                  {stat.trendUp ? (
                    <ArrowUpRight className="h-4 w-4 ml-1" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 ml-1" />
                  )}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-2 font-medium">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {prospects.length === 0 && (
          <div className="col-span-full text-center text-muted-foreground py-12">
            <div className="text-lg font-medium">Aucun prospect trouvé.</div>
            <p className="text-sm mt-2">Commencez par ajouter votre premier prospect.</p>
          </div>
        )}
        {prospects.map((prospect, index) => (
          <Card 
            key={prospect.id} 
            variant="modern" 
            className="w-full animate-slide-in-up hover:shadow-large transition-all duration-300"
            style={{ animationDelay: `${(index + 3) * 100}ms` }}
          >
            <div className="flex justify-between items-start p-4 pb-2">
              <div />
              <div className="flex gap-1">
                <Link href={`/prospects/${prospect.id}`} title="Détails">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Activity className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href={`/prospects/${prospect.id}/edit`} title="Modifier">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <UserPlus className="h-4 w-4 text-blue-500" />
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => {
                    setProspectToDelete(prospect)
                    setOpenConfirmDialog(true)
                  }}
                >
                  <Trash className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
            <CardHeader className="pb-3 pt-0 flex flex-row items-center gap-3 px-4">
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/20">
                <UserCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-foreground leading-tight">
                  {prospect.first_name || prospect.last_name
                    ? `${prospect.first_name || ''} ${prospect.last_name || ''}`.trim()
                    : prospect.email}
                </CardTitle>
                <div className="text-xs text-muted-foreground font-medium mt-1">Prospect #{prospect.id?.slice(0, 8)}</div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 pb-4 px-4">
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="p-1.5 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <Mail className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                </div>
                <span className="text-foreground font-medium truncate">{prospect.email || '—'}</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="p-1.5 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <Phone className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                </div>
                <span className="text-foreground font-medium truncate">{prospect.phone || '—'}</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="p-1.5 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <BadgeEuro className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Budget</span>
                  <span className="text-foreground font-semibold">
                    {prospect.budget_min ? `${prospect.budget_min} €` : '—'}
                    {prospect.budget_max ? ` - ${prospect.budget_max} €` : ''}
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-3 text-muted-foreground">
                <div className="p-1.5 rounded-lg bg-gray-50 dark:bg-gray-800/50 mt-0.5">
                  <MapPin className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Localisation souhaitée</span>
                  <span className="text-foreground font-medium truncate">
                    {prospect.desired_locations && prospect.desired_locations.length > 0 
                      ? prospect.desired_locations.join(', ') 
                      : '—'}
                  </span>
                </div>
              </div>
              {prospect.notes && (
                <div className="flex items-start gap-3 text-muted-foreground">
                  <div className="p-1.5 rounded-lg bg-gray-50 dark:bg-gray-800/50 mt-0.5">
                    <StickyNote className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">Notes</span>
                    <span className="text-foreground font-medium text-sm leading-relaxed">{prospect.notes}</span>
                  </div>
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
    </>
  )
} 