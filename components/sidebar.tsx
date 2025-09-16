'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  HomeIcon,
  Building2Icon,
  UsersIcon,
  UserIcon,
  CalendarIcon,
  FileTextIcon,
  BarChartIcon
} from 'lucide-react'
import { UserButton } from '@clerk/nextjs'
import { ModeToggle } from '@/components/mode-toggle'

const navigation = [
  { name: 'Tableau de bord', href: '/dashboard', icon: HomeIcon },
  { name: 'Propriétés', href: '/properties', icon: Building2Icon },
  { name: 'Clients', href: '/clients', icon: UsersIcon },
  { name: 'Prospects', href: '/prospects', icon: UserIcon },
  { name: 'Visites', href: '/visits', icon: CalendarIcon },
  { name: 'CRM', href: '/crm', icon: BarChartIcon },
  { name: 'Analytique', href: '/analytics', icon: BarChartIcon },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-full sidebar-modern">
      {/* Header avec logo modernisé */}
      <div className="flex h-20 items-center px-6 border-b border-border/50">
        <Link href="/dashboard" className="group">
          <span className="text-2xl font-bold text-foreground tracking-tight group-hover:text-blue-600 transition-colors duration-300">
            Keyora
          </span>
        </Link>
      </div>

      {/* Navigation modernisée */}
      <div className="flex-1 flex flex-col gap-2 px-4 py-6">
        {navigation.map((item, index) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 relative overflow-hidden',
                isActive
                  ? 'text-white shadow-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
              )}
              style={{
                animationDelay: `${index * 100}ms`
              }}
            >
              {/* Background pour l'état actif */}
              {isActive && (
                <div className="absolute inset-0 bg-blue-600 rounded-xl" />
              )}
              
              {/* Effet de hover */}
              {!isActive && (
                <div className="absolute inset-0 bg-accent/10 group-hover:bg-accent/20 rounded-xl transition-all duration-300" />
              )}
              
              <div className="relative z-10 flex items-center gap-3">
                <div className={cn(
                  'p-2 rounded-lg transition-all duration-300',
                  isActive 
                    ? 'bg-white/20' 
                    : 'group-hover:bg-accent/30'
                )}>
                  <item.icon
                    className={cn(
                      'h-5 w-5 transition-all duration-300',
                      isActive 
                        ? 'text-white' 
                        : 'text-muted-foreground group-hover:text-foreground'
                    )}
                    aria-hidden="true"
                  />
                </div>
                <span className="relative z-10">{item.name}</span>
              </div>
              
              {/* Indicateur d'état actif */}
              {isActive && (
                <div className="absolute right-2 w-2 h-2 bg-white rounded-full" />
              )}
            </Link>
          )
        })}
      </div>

      {/* Footer modernisé */}
      <div className="p-4 border-t border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UserButton 
              afterSignOutUrl="/" 
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10 rounded-xl shadow-soft hover:shadow-medium transition-all duration-300"
                }
              }}
            />
            <div>
              <p className="text-sm font-medium">Utilisateur</p>
              <p className="text-xs text-muted-foreground">En ligne</p>
            </div>
          </div>
          <div className="p-2 rounded-xl bg-accent/50 hover:bg-accent transition-all duration-300">
            <ModeToggle />
          </div>
        </div>
      </div>
    </div>
  )
} 