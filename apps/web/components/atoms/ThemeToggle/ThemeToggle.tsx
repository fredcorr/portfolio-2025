'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { cn } from '@/utils/cn'
import Icon from '../Icon/Icon'

const THEME_STORAGE_KEY = 'portfolio-theme'

const Theme = {
  Light: 'light',
  Dark: 'dark',
} as const

type ThemeValue = (typeof Theme)[keyof typeof Theme]

const applyTheme = (theme: ThemeValue) => {
  const root = document.documentElement
  root.classList.toggle('dark', theme === Theme.Dark)
}

const resolveStoredTheme = (): ThemeValue | null => {
  if (typeof window === 'undefined') {
    return null
  }

  const raw = window.localStorage.getItem(THEME_STORAGE_KEY)

  if (raw === Theme.Dark || raw === Theme.Light) {
    return raw
  }

  return null
}

const resolvePreferredTheme = (): ThemeValue => {
  if (typeof window === 'undefined') {
    return Theme.Light
  }

  const stored = resolveStoredTheme()
  if (stored) {
    return stored
  }

  const prefersDark =
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches

  return prefersDark ? Theme.Dark : Theme.Light
}

export const ThemeToggle = () => {
  const t = useTranslations('theme')
  const [theme, setTheme] = useState<ThemeValue>(Theme.Light)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    const preferred = resolvePreferredTheme()
    setTheme(preferred)
    applyTheme(preferred)
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) {
      return
    }

    applyTheme(theme)
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme, isMounted])

  const handleToggle = () => {
    setTheme(current => (current === Theme.Light ? Theme.Dark : Theme.Light))
  }

  const isDark = theme === Theme.Dark

  return (
    <div
      id="theme-toggle"
      className="pointer-events-none fixed bottom-6 right-6 z-50 flex items-center justify-end"
    >
      <button
        type="button"
        onClick={handleToggle}
        className={cn(
          'pointer-events-auto inline-flex items-center gap-2 rounded-full border border-black/10 bg-black px-2 pt-1 pb-[0.5rem] font-heading text-sm uppercase tracking-[0.08em] text-white shadow-lg transition',
          'hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black',
          'dark:border-white/10 dark:bg-gray-50 dark:text-black dark:focus-visible:outline-white'
        )}
        aria-label={isDark ? t('activateLight') : t('activateDark')}
      >
        <span aria-hidden="true" className="text-lg">
          <Icon name={isDark ? 'sun' : 'moon'} />
        </span>
      </button>
    </div>
  )
}
