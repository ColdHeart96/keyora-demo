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
    <div className="flex flex-col h-full bg-background">
      <div className="flex h-16 items-center px-6 border-b">
        <Link href="/dashboard" className="flex items-center">
          <span className="text-xl font-semibold">
            Keyora
          </span>
        </Link>
      </div>

      <div className="flex-1 flex flex-col gap-1 px-3 py-6">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-primary/5 hover:text-primary'
              )}
            >
              <item.icon
                className={cn(
                  'h-5 w-5',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          )
        })}
      </div>

      <div className="p-4 border-t">
        <div className="flex items-center justify-between">
          <UserButton afterSignOutUrl="/" />
          <ModeToggle />
        </div>
      </div>
    </div>
  )
} 