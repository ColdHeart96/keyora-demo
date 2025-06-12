"use client";
import { Sidebar } from '@/components/sidebar'
import { usePathname } from 'next/navigation'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  const hideSidebar = pathname === '/sign-up' || pathname === '/(auth)/sign-up';
  return (
    <div className="flex min-h-screen">
      {!hideSidebar && (
        <aside className="w-64 fixed inset-y-0 z-50 border-r bg-background">
          <Sidebar />
        </aside>
      )}
      <main className={!hideSidebar ? "flex-1 ml-64 flex flex-col min-h-screen" : "flex-1 flex flex-col min-h-screen"}>
        {children}
      </main>
    </div>
  )
} 