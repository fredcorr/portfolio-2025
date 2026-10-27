'use client'

import React from 'react'

export interface NavigationContextValue {
  isPickerOpen: boolean
  setPickerOpen: (isOpen: boolean) => void
  /**
   * Full-width element on the header's bottom edge that panels portal into,
   * so they span the whole viewport rather than the row they're triggered from.
   */
  panelContainer: HTMLElement | null
}

/**
 * Lets panels rendered *into* the nav from elsewhere (the `@languages` slot is
 * a server component, so it cannot take callbacks as props) coordinate with
 * it: one overlay open at a time, and no blend mode under an open panel.
 */
export const NavigationContext =
  React.createContext<NavigationContextValue | null>(null)

/**
 * The picker's open state: shared with the nav when inside one, local
 * otherwise (tests, or a picker rendered on its own).
 */
export const usePickerState = (): [boolean, (isOpen: boolean) => void] => {
  const context = React.useContext(NavigationContext)
  const [localOpen, setLocalOpen] = React.useState(false)

  return context
    ? [context.isPickerOpen, context.setPickerOpen]
    : [localOpen, setLocalOpen]
}

export const usePanelContainer = (): HTMLElement | null =>
  React.useContext(NavigationContext)?.panelContainer ?? null
