'use client'

import { ThemeProvider } from 'next-themes'
import { ClerkProvider } from "@clerk/nextjs"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange={false}
        themes={['light', 'dark', 'system']}
        value={{
          light: 'light',
          dark: 'dark',
          system: 'system',
        }}
      >
        {children}
      </ThemeProvider>
    </ClerkProvider>
  )
} 