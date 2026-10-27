import { useTranslations } from 'next-intl'
import React from 'react'
import Link from 'next/link'

import { cn } from '@/utils/cn'
import slugToBreadcrumbs from '@/utils/slug'

export interface BreadcrumbsProps extends React.HTMLAttributes<HTMLElement> {
  slug?: string | null
  /** Overrides the final crumb's label, so it can read the document title
   * rather than the title-cased slug segment. */
  currentLabel?: string | null
}

const Breadcrumbs = ({
  slug,
  currentLabel,
  className,
  ...props
}: BreadcrumbsProps) => {
  const t = useTranslations('breadcrumbs')
  const derivedItems = slugToBreadcrumbs(slug, currentLabel)
  const visibleItems = derivedItems.filter(item => item.label.trim().length > 0)

  if (visibleItems.length === 0) {
    return null
  }

  return (
    <nav
      aria-label={t('label')}
      className={cn('text-sm font-medium tracking-tight', className)}
      {...props}
    >
      <ol className="flex flex-wrap items-center gap-2">
        {visibleItems.map((item, index) => {
          const isLast = index === visibleItems.length - 1
          const isCurrent = Boolean(item.isCurrent) || isLast

          return (
            <li key={`${item.label}-${index}`} className="flex items-center">
              {item.href && !isCurrent && (
                <Link
                  href={item.href}
                  className={cn(
                    'text-black/70 transition hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black dark:text-foreground/70 dark:hover:text-foreground dark:focus-visible:outline-white'
                  )}
                >
                  {item.label}
                </Link>
              )}
              {(!item.href || isCurrent) && (
                <span
                  className={cn(
                    'text-black dark:text-foreground',
                    !isCurrent && 'text-black/70 dark:text-foreground/70'
                  )}
                  {...(isCurrent && { 'aria-current': 'page' })}
                >
                  {item.label}
                </span>
              )}
              {!isLast && (
                <span
                  aria-hidden="true"
                  className="mx-2 text-black/70 dark:text-foreground/70"
                >
                  →
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export default Breadcrumbs
