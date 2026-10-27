'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import type { NavigationItem } from '@portfolio/types/components'
import { DEFAULT_LOCALE, type Locale } from '@portfolio/types/base'
import { toCmsSlug } from '@portfolio/utils/locale'

import Logo from '@/components/atoms/Logo/Logo'
import Icon from '@/components/atoms/Icon/Icon'
import NavItem, { NavItemLayout } from '@/components/molecules/NavItem/NavItem'
import { cn } from '@/utils/cn'
import getPagePath from '@/utils/get-page-path'
import {
  NavigationContext,
  type NavigationContextValue,
} from './navigation-context'
import useFocusTrap from '@/utils/use-focus-trap'
import useLockScroll from '@/utils/use-lock-scroll'

export interface NavigationProps {
  items: NavigationItem[]
  projectCount?: number
  locale?: Locale
  /** The language picker, rendered by the layout's `@languages` slot. */
  languageSwitch?: React.ReactNode
  className?: string
}

const Navigation = ({
  items,
  projectCount,
  locale = DEFAULT_LOCALE,
  languageSwitch,
  className,
}: NavigationProps) => {
  const t = useTranslations('nav')
  const pathname = usePathname()
  const [isOpen, setIsOpen] = React.useState(false)
  const [isHidden, setIsHidden] = React.useState(false)
  const [isPickerOpen, setIsPickerOpen] = React.useState(false)
  const [panelContainer, setPanelContainer] =
    React.useState<HTMLDivElement | null>(null)
  const [currentPath, setCurrentPath] = React.useState('')
  const lastScrollYRef = React.useRef(0)
  const lastTickRef = React.useRef(0)
  const menuRef = React.useRef<HTMLDivElement | null>(null)
  const menuId = React.useId()

  React.useEffect(() => {
    if (pathname && pathname.length > 0) {
      setCurrentPath(pathname)
    }
  }, [pathname])

  // One overlay at a time: the menu and the language bar each close the other.
  const handleToggle = React.useCallback(() => {
    setIsPickerOpen(false)
    setIsOpen(previous => !previous)
  }, [])

  const setPickerOpen = React.useCallback((next: boolean) => {
    next && setIsOpen(false)
    setIsPickerOpen(next)
  }, [])

  const navigationContext = React.useMemo<NavigationContextValue>(
    () => ({ isPickerOpen, setPickerOpen, panelContainer }),
    [isPickerOpen, setPickerOpen, panelContainer]
  )

  const handleNavigate = React.useCallback(() => {
    setIsOpen(false)
  }, [])

  React.useEffect(() => {
    setIsOpen(false)
    setIsPickerOpen(false)
  }, [pathname])

  useLockScroll(isOpen)
  useFocusTrap({
    active: isOpen,
    containerRef: menuRef,
    onDeactivate: handleNavigate,
  })

  const handleScroll = React.useCallback(() => {
    const now = Date.now()
    const lastTick = lastTickRef.current
    const shouldRun = now - lastTick > 120

    if (shouldRun && typeof window !== 'undefined') {
      lastTickRef.current = now
      window.requestAnimationFrame(() => {
        const currentScrollY = window.scrollY
        const lastScrollY = lastScrollYRef.current
        const isScrollingDown = currentScrollY > lastScrollY
        const shouldHide = isScrollingDown && currentScrollY > 80

        setIsHidden(shouldHide)
        // A bar left open on a nav that slid away would float on its own.
        shouldHide && setIsPickerOpen(false)
        lastScrollYRef.current = currentScrollY
      })
    }
  }, [])

  React.useEffect(() => {
    lastScrollYRef.current = window.scrollY
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll])

  let buttonLabel = t('openMenu')
  if (isOpen && buttonLabel.length >= 0) {
    buttonLabel = t('closeMenu')
  }

  const homeHref = getPagePath({ slug: toCmsSlug(locale) })

  return (
    <NavigationContext.Provider value={navigationContext}>
      <header
        data-organism="navigation"
        data-development="Sticky navigation that stays visible when not scrolling."
        className={cn(
          'fixed top-0 left-0 right-0 z-50 px-4 transition-[transform,opacity] duration-300 md:px-6',
          // The blend inverts the nav over whatever is behind it; an open
          // language bar is opaque, so the nav sits on the background instead.
          isPickerOpen ? 'bg-background text-foreground' : 'md:text-white',
          !isOpen && !isPickerOpen && 'mix-blend-difference text-white',
          isHidden && '-translate-y-24 pointer-events-none opacity-0',
          className
        )}
      >
        <div
          aria-hidden={!isOpen}
          className={cn(
            'fixed inset-0 z-30 bg-black/15 opacity-0 transition-opacity duration-300 motion-reduce:transition-none md:hidden',
            'dark:bg-white/5',
            isOpen && 'pointer-events-auto opacity-100',
            !isOpen && 'pointer-events-none'
          )}
          onClick={handleNavigate}
        />
        <nav className="relative mx-auto w-full lg:px-5 ">
          <div
            className={cn(
              'relative z-50 flex items-center justify-between py-4 transition-shadow',
              'md:px-0 md:py-[1.29rem]',
              isOpen && 'rounded-b-none',
              'dark:text-foreground'
            )}
          >
            <Link
              href={homeHref}
              aria-label={t('home')}
              className={cn(
                'inline-flex items-center text-black dark:text-white md:text-current focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current',
                !isOpen && 'text-current'
              )}
            >
              <Logo className="h-[2.7rem] text-current" />
            </Link>

            <div className="flex items-center gap-2 md:gap-3">
              <ul className="hidden items-center gap-3 md:flex">
                {items.map((item, index) => (
                  <NavItem
                    key={item._id}
                    item={item}
                    currentPath={currentPath}
                    projectCount={projectCount}
                    layout={NavItemLayout.Row}
                    isOpen={isOpen}
                    index={index}
                    onNavigate={handleNavigate}
                    blendMode
                  />
                ))}
              </ul>
              {languageSwitch}

              <button
                type="button"
                aria-label={buttonLabel}
                aria-expanded={isOpen}
                aria-controls={menuId}
                onClick={handleToggle}
                className={cn(
                  'relative inline-flex size-10 items-center justify-center rounded-full bg-black text-white transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black md:hidden',
                  'dark:bg-white dark:text-surface-1'
                )}
              >
                <span className="relative size-6">
                  <Icon
                    name="menu"
                    className={cn(
                      'absolute inset-0 size-6 transition-all duration-300',
                      !isOpen && 'opacity-100 rotate-0 scale-100',
                      isOpen && 'opacity-0 -rotate-90 scale-75'
                    )}
                    title={t('openMenuIcon')}
                  />
                  <Icon
                    name="x"
                    className={cn(
                      'absolute inset-0 size-6 transition-all duration-300',
                      isOpen && 'opacity-100 rotate-0 scale-100',
                      !isOpen && 'opacity-0 rotate-90 scale-75'
                    )}
                    title={t('closeMenuIcon')}
                  />
                </span>
              </button>
            </div>
          </div>

          <div
            id={menuId}
            role="dialog"
            aria-modal="true"
            data-development="Menu opens on click with staggered item transitions."
            ref={menuRef}
            aria-hidden={!isOpen}
            tabIndex={-1}
            className={cn(
              'fixed inset-0 z-40 overflow-y-auto overscroll-contain bg-surface-1 transition-[opacity,transform] duration-300 motion-reduce:transition-none md:hidden',
              isOpen && 'opacity-100',
              !isOpen && 'pointer-events-none opacity-0 -translate-y-2'
            )}
          >
            <div className="flex min-h-screen w-full flex-col items-center justify-center px-4 py-8 pb-[calc(2rem+env(safe-area-inset-bottom))]">
              <button
                type="button"
                onClick={handleNavigate}
                className="sr-only"
              >
                {t('closeMenu')}
              </button>
              <ul className="flex w-full flex-col items-center gap-4 text-center text-black dark:text-foreground">
                {items.map((item, index) => (
                  <NavItem
                    key={item._id}
                    item={item}
                    currentPath={currentPath}
                    projectCount={projectCount}
                    layout={NavItemLayout.Column}
                    isOpen={isOpen}
                    index={index}
                    onNavigate={handleNavigate}
                  />
                ))}
              </ul>
            </div>
          </div>
        </nav>
        <div ref={setPanelContainer} className="absolute inset-x-0 top-full" />
      </header>
    </NavigationContext.Provider>
  )
}

export default Navigation
