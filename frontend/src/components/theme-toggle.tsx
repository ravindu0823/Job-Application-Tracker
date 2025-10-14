'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const isLight = theme === 'light'

  return (
    <button
      onClick={() => setTheme(isLight ? 'dark' : 'light')}
      className={`relative w-16 h-8 rounded-full flex items-center px-1 cursor-pointer transition-colors duration-500 ${
        isLight ? 'bg-yellow-400' : 'bg-gray-800'
      }`}
    >

      <Sun
        className={`absolute left-2 top-1/2 transform -translate-y-1/2 h-5 w-5 transition-colors duration-500 ${
          isLight ? 'text-white' : 'text-yellow-200'
        }`}
      />
      <Moon
        className={`absolute right-2 top-1/2 transform -translate-y-1/2 h-5 w-5 transition-colors duration-500 ${
          isLight ? 'text-gray-400' : 'text-white'
        }`}
      />

      <span
        className={`absolute top-1 left-1 w-6 h-6 bg-white/90 rounded-full shadow-md transition-all duration-500 ease-in-out ${
          isLight ? 'translate-x-0' : 'translate-x-8'
        }`}
      />
    </button>
  )
}
