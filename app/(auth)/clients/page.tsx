'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserPlus, UserCheck, Mail, Phone, Activity, ArrowUpRight, ArrowDownRight, Plus } from 'lucide-react'
import { DataTable } from './components/data-table'
import { columns } from './components/columns'
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"

export default function ClientsPage() {
  const pathname = usePathname()
  const isClientsPage = pathname === "/clients"
  const isNewClientPage = pathname === "/clients/new"

  const { user } = useUser()
  const supabase = createClientComponentClient()
  const [stats, setStats] = useState({
    totalClients: 0,
    newClients: 0,
    activeClients: 0,
    conversionRate: 0
  })
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return

      try {
        // Fetch total clients
        const { data: totalClients, error: totalError } = await supabase
          .from('clients')
          .select('count')
          .eq('user_id', user.id)
          .single()

        // Fetch new clients (last 30 days)
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        
        const { data: newClients, error: newError } = await supabase
          .from('clients')
          .select('count')
          .eq('user_id', user.id)
          .gte('created_at', thirtyDaysAgo.toISOString())
          .single()

        // Fetch active clients
        const { data: activeClients, error: activeError } = await supabase
          .from('clients')
          .select('count')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .single()

        setStats({
          totalClients: totalClients?.count || 0,
          newClients: newClients?.count || 0,
          activeClients: activeClients?.count || 0,
          conversionRate: totalClients?.count ? parseFloat(((activeClients?.count / totalClients?.count) * 100).toFixed(1)) : 0
        })

        // Fetch clients list
        const { data: clientsList, error: clientsError } = await supabase
          .from('clients')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (clientsList) {
          setClients(clientsList)
        }

      } catch (error) {
        console.error('Error fetching client stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [user, supabase])

  const stats_cards = [
    {
      title: "Total Clients",
      value: stats.totalClients,
      description: "Base totale",
      icon: Users,
      trend: "+8.5%",
      trendUp: true,
      color: "blue"
    },
    {
      title: "Nouveaux Clients",
      value: stats.newClients,
      description: "30 derniers jours",
      icon: UserPlus,
      trend: "+12.2%",
      trendUp: true,
      color: "green"
    },
    {
      title: "Clients Actifs",
      value: stats.activeClients,
      description: "En recherche active",
      icon: UserCheck,
      trend: "+3.1%",
      trendUp: true,
      color: "purple"
    },
    {
      title: "Taux de Conversion",
      value: `${stats.conversionRate}%`,
      description: "Clients actifs/total",
      icon: Activity,
      trend: "+2.4%",
      trendUp: true,
      color: "yellow"
    }
  ]

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 dark:bg-black">
      <div className="flex items-center justify-between space-y-2 pb-10">
        <div className="space-y-0.5">
          <h2 className="text-2xl font-bold tracking-tight dark:text-white">Clients</h2>
          <p className="text-muted-foreground dark:text-gray-400">
            Gérez vos clients et leurs informations
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Link href="/clients/new">
            <Button className="bg-blue-500 hover:bg-blue-600 dark:text-white">
              <Plus className="mr-2 h-4 w-4" />
              Nouveau client
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats_cards.map((stat, index) => (
          <Card key={index} className="shadow-lg p-6 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium dark:text-gray-200">
                {stat.title}
              </CardTitle>
              <div className="p-2 rounded-full dark:bg-black/40">
                <stat.icon className="h-4 w-4 dark:text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <div className="text-2xl font-bold dark:text-white">{stat.value}</div>
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
              <p className="text-xs dark:text-gray-400">
                {stat.description}
              </p>
            </CardContent>
            <div
              className={`absolute bottom-0 left-0 h-0.5 w-full dark:bg-white/10`}
            />
          </Card>
        ))}
      </div>

      <div className="grid gap-4 grid-cols-1">
        <Card className="shadow-lg p-6 transition-colors">
          <CardHeader>
            <CardTitle className="dark:text-white">Liste des Clients</CardTitle>
            <CardDescription className="dark:text-gray-400">
              Gérez vos clients et leurs informations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={clients} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 