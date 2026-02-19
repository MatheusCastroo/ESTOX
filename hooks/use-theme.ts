'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function useThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    if (theme === 'dark') {
      setTheme('light')
    } else if (theme === 'light') {
      setTheme('dark')
    } else {
      // system theme
      setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
    }
  }

  return {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
    mounted,
  }
}
