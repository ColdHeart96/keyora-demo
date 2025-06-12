"use client";
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Providers } from './providers'
import { Toaster } from '@/components/ui/toaster'
import { N8nChatbotEmbedConditional } from '../components/N8nChatbotEmbedConditional'
import '../styles/n8n-chatbot-custom.css'
import { ThemeSyncer } from '@/components/ThemeSyncer'

const inter = Inter({ subsets: ['latin'] })


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            {children}
            <Toaster />
            <ThemeSyncer />
          </Providers>
        </ThemeProvider>
        <N8nChatbotEmbedConditional />
      </body>
    </html>
  )
}