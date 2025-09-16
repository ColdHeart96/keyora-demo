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
import { Navbar } from "@/components/navbar"

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
    <>
      <Navbar 
        title="Clients" 
        description="Gérez vos clients et leurs informations"
      >
        <Link href="/clients/new">
          <Button variant="default" size="lg" className="bg-blue-600 hover:bg-blue-700 text-white shadow-medium">
            <Plus className="mr-2 h-5 w-5" />
            Nouveau client
          </Button>
        </Link>
      </Navbar>
      <div className="flex-1 space-y-6 p-6 pt-4 bg-background max-w-7xl mx-auto">
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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

      <div className="grid gap-6 grid-cols-1">
        <Card variant="modern" className="animate-slide-in-up" style={{ animationDelay: '400ms' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
              Liste des Clients
            </CardTitle>
            <CardDescription>
              Gérez vos clients et leurs informations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={clients} />
          </CardContent>
        </Card>
      </div>
      </div>
    </>
  )
} 