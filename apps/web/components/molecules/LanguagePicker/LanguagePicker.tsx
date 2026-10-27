'use client'

import React from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { Locale } from '@portfolio/types/base'

import Icon from '@/components/atoms/Icon/Icon'
import {
  usePanelContainer,
  usePickerState,
} from '@/components/organisms/Navigation/navigation-context'
import { cn } from '@/utils/cn'
import type { LanguageOption } from '@/utils/get-language-options'
import useFocusTrap from '@/utils/use-focus-trap'
import { LANGUAGE_NAMES, LANGUAGE_PICKER_STRINGS } from './strings'

export interface LanguagePickerProps {
  locale: Locale
  options: LanguageOption[]
  className?: string
}

const OPTION_SELECTOR = '[data-language-option]'

const getOptionLabel = (
  option: LanguageOption,
  strings: (typeof LANGUAGE_PICKER_STRINGS)[Locale]
) => {
  const name = LANGUAGE_NAMES[option.locale]

  if (option.isCurrent) {
    return `${name} (${strings.current})`
  }

  return option.isAvailable ? name : `${name} — ${strings.homepageFallback}`
}

const LanguagePicker = ({
  locale,
  options,
  className,
}: LanguagePickerProps) => {
  const pathname = usePathname()
  const [isOpen, setOpen] = usePickerState()
  const panelContainer = usePanelContainer()
  const rootRef = React.useRef<HTMLDivElement | null>(null)
  const barRef = React.useRef<HTMLDivElement | null>(null)
  const barId = React.useId()
  const strings = LANGUAGE_PICKER_STRINGS[locale]

  const close = React.useCallback(() => setOpen(false), [setOpen])

  useFocusTrap({ active: isOpen, containerRef: barRef, onDeactivate: close })

  // The trap focuses the first option; the design lands on the current one.
  React.useEffect(() => {
    if (isOpen) {
      barRef.current
        ?.querySelector<HTMLElement>(`${OPTION_SELECTOR}[aria-current="true"]`)
        ?.focus()
    }
  }, [isOpen])

  React.useEffect(() => {
    close()
  }, [pathname, close])

  React.useEffect(() => {
    if (!isOpen) {
      return
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target
      const isInside =
        target instanceof Node &&
        [rootRef.current, barRef.current].some(node => node?.contains(target))

      if (!isInside) {
        close()
      }
    }

    document.addEventListener('pointerdown', handlePointerDown, true)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true)
    }
  }, [isOpen, close])

  const handleBarKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const keys = ['ArrowRight', 'ArrowLeft', 'Home', 'End']

    if (!keys.includes(event.key) || !barRef.current) {
      return
    }

    const items = Array.from(
      barRef.current.querySelectorAll<HTMLElement>(OPTION_SELECTOR)
    )
    const index = items.indexOf(document.activeElement as HTMLElement)
    const isEdgeKey = event.key === 'Home' || event.key === 'End'

    if (items.length === 0 || (index < 0 && !isEdgeKey)) {
      return
    }

    event.preventDefault()

    const nextIndex = {
      Home: 0,
      End: items.length - 1,
      ArrowRight: (index + 1) % items.length,
      ArrowLeft: (index - 1 + items.length) % items.length,
    }[event.key]

    items[nextIndex ?? 0]?.focus()
  }

  const bar = (
    <div
      ref={barRef}
      id={barId}
      role="toolbar"
      aria-label={strings.toolbarLabel}
      aria-hidden={!isOpen}
      onKeyDown={handleBarKeyDown}
      className={cn(
        'border-t border-gray-100 border-b border-b-foreground bg-background text-foreground',
        // Stays mounted so it can animate; `invisible` keeps a closed bar out
        // of the tab order and the accessibility tree, as `hidden` would.
        // Visibility is only transitioned on the way out (it stays visible
        // until the fade ends); on the way in it flips at once, so the
        // current option can take focus immediately. `translate-*` sets the
        // `translate` property, not `transform`.
        'duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none',
        isOpen
          ? 'visible translate-y-0 opacity-100 transition-[opacity,translate]'
          : 'pointer-events-none invisible -translate-y-2 opacity-0 transition-[opacity,translate,visibility]',
        // Inside a nav the container positions it; on its own it hangs
        // from the trigger's wrapper.
        !panelContainer && 'absolute inset-x-0 top-full'
      )}
    >
      <div className="flex min-h-14 items-center gap-3 px-4 md:gap-8 md:px-6 lg:px-11">
        <span
          aria-hidden="true"
          className="font-heading text-label uppercase tracking-[0.12em] text-gray-200"
        >
          {strings.readIn}
        </span>
        <ul className="flex flex-1 gap-1">
          {options.map(option => (
            <li key={option.locale}>
              <Link
                href={option.href}
                hrefLang={option.locale}
                lang={option.locale}
                data-language-option
                aria-current={option.isCurrent ? 'true' : undefined}
                aria-label={getOptionLabel(option, strings)}
                onClick={close}
                className={cn(
                  'group relative inline-flex min-h-12 items-center px-3 font-body text-body-lg tracking-[-0.01em] text-foreground md:min-h-11',
                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-foreground',
                  option.isCurrent &&
                    'after:absolute after:inset-x-3 after:bottom-2 after:h-0.5 after:bg-foreground'
                )}
              >
                <span
                  className={cn(
                    !option.isCurrent &&
                      'underline-offset-[5px] group-hover:underline'
                  )}
                >
                  {LANGUAGE_NAMES[option.locale]}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <button
          type="button"
          aria-label={strings.close}
          onClick={close}
          className="inline-flex size-11 shrink-0 items-center justify-center transition hover:bg-surface-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-foreground"
        >
          <Icon name="x" className="size-3" />
        </button>
      </div>
    </div>
  )

  return (
    <div
      ref={rootRef}
      data-molecule="language-picker"
      data-development="Opens a language toolbar under the nav that overlays the page."
      className={cn(!panelContainer && 'relative', className)}
    >
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={barId}
        onClick={() => setOpen(!isOpen)}
        className="inline-flex min-h-11 items-center gap-2 px-3 font-body text-body-lg tracking-[-0.02em] text-current transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current"
      >
        <span className="sr-only">{strings.triggerPrefix}</span>
        <span>{locale.toUpperCase()}</span>
        <Icon
          name="chevron-down"
          className={cn(
            'size-3 shrink-0 transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {panelContainer ? createPortal(bar, panelContainer) : bar}
    </div>
  )
}

export default LanguagePicker
