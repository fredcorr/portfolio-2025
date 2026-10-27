'use client'

import { useTranslations } from 'next-intl'
import Button from '@/components/atoms/Button/Button'
import { cn } from '@/utils/cn'

export interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

/**
 * Builds the windowed page sequence: first, last, current and its neighbours,
 * with '...' gaps. e.g. (4, 20) -> [1, '...', 3, 4, 5, '...', 20].
 */
const buildPageNumbers = (
  current: number,
  total: number
): (number | '...')[] => {
  const candidates = [1, total, current, current - 1, current + 1].filter(
    n => n >= 1 && n <= total
  )
  const show = Array.from(new Set(candidates)).sort((a, b) => a - b)
  const result: (number | '...')[] = []
  show.forEach((n, i) => {
    if (i > 0 && n - show[i - 1] > 1) result.push('...')
    result.push(n)
  })
  return result
}

const Chevron = ({ direction }: { direction: 'left' | 'right' }) => (
  <svg
    className="size-3"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    aria-hidden="true"
  >
    <polyline
      points={direction === 'left' ? '15 18 9 12 15 6' : '9 6 15 12 9 18'}
    />
  </svg>
)

/**
 * Pure, reusable pagination control. Caller owns `currentPage` state and
 * derives `totalPages` (e.g. from a GROQ `total` count). Renders nothing when
 * there is a single page.
 */
const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) => {
  const t = useTranslations('pagination')
  if (totalPages <= 1) return null

  return (
    <nav
      className={cn(
        'flex items-center justify-center md:justify-end gap-1',
        className
      )}
      aria-label={t('label')}
    >
      <Button
        variant="outline"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="inline-flex items-center gap-2 px-[18px]"
      >
        <Chevron direction="left" />
        {t('previous')}
      </Button>

      {buildPageNumbers(currentPage, totalPages).map((item, i) =>
        item === '...' ? (
          <span
            key={`gap-${i}`}
            className="px-1.5 font-heading text-body-md text-foreground/70"
          >
            …
          </span>
        ) : (
          <Button
            key={item}
            variant="outline"
            onClick={() => onPageChange(item)}
            aria-current={item === currentPage ? 'page' : undefined}
            className={cn(
              'inline-flex size-10 items-center justify-center p-0',
              item === currentPage &&
                'border-foreground bg-foreground text-background hover:border-foreground hover:text-background'
            )}
          >
            {item}
          </Button>
        )
      )}

      <Button
        variant="outline"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="inline-flex items-center gap-2 px-[18px]"
      >
        {t('next')}
        <Chevron direction="right" />
      </Button>
    </nav>
  )
}

Pagination.displayName = 'Pagination'

export default Pagination
