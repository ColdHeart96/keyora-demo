'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline'

export function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme, setTheme, theme } = useTheme()

  // Monter le composant côté client uniquement
  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }

  if (!mounted) {
    return (
      <button
        className="w-9 h-9 rounded-lg bg-gray-200 dark:bg-gray-600 animate-pulse"
        disabled
      >
        <span className="sr-only">Chargement du thème</span>
      </button>
    )
  }

  return (
    <button
      onClick={toggleTheme}
      className="relative w-9 h-9 flex items-center justify-center rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-700 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      aria-label={resolvedTheme === 'dark' ? 'Passer au thème clair' : 'Passer au thème sombre'}
    >
      <span className="sr-only">
        {resolvedTheme === 'dark' ? 'Passer au thème clair' : 'Passer au thème sombre'}
      </span>
      
      <SunIcon 
        className={`w-5 h-5 absolute transition-all duration-300 ${
          resolvedTheme === 'dark' 
            ? 'opacity-100 rotate-0 scale-100' 
            : 'opacity-0 rotate-90 scale-0'
        } text-yellow-500`}
      />
      
      <MoonIcon 
        className={`w-5 h-5 absolute transition-all duration-300 ${
          resolvedTheme === 'dark'
            ? 'opacity-0 -rotate-90 scale-0'
            : 'opacity-100 rotate-0 scale-100'
        } text-gray-900 dark:text-gray-100`}
      />
    </button>
  )
} 