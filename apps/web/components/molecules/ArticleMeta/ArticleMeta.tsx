import React from 'react'
import type { ArticleIntroProps } from '@portfolio/types/components'
import { cn } from '@/utils/cn'
import { StaggerChildren } from '@/components/animation/StaggerChildren/StaggerChildren'
import { FadeIn } from '@/components/animation/FadeIn/FadeIn'

export interface ArticleMetaProps extends Pick<
  ArticleIntroProps,
  | 'author'
  | 'dateLabel'
  | 'publishedYear'
  | 'readTimeLabel'
  | 'tags'
  | 'editionNumber'
> {
  className?: string
}

const ArticleMeta: React.FC<ArticleMetaProps> = ({
  author,
  dateLabel,
  publishedYear,
  readTimeLabel,
  tags,
  editionNumber,
  className,
}) => {
  const authorName =
    [author?.firstName, author?.secondName].filter(Boolean).join(' ') ||
    'Author'
  const authorInitials =
    [author?.firstName?.[0], author?.secondName?.[0]]
      .filter(Boolean)
      .join('') || '?'
  // Derived only from CMS data. Falling back to `new Date()` would read the
  // current time during prerender, which Cache Components rejects — and it
  // would bake the build year into an article that has no date, which is a
  // guess rather than a fact.
  const year = publishedYear
  const editionLabel =
    editionNumber != null
      ? [`N° ${padEdition(editionNumber)}`, year].filter(Boolean).join(' / ')
      : undefined
  const topicsLabel = tags?.join(', ')

  function padEdition(n: number): string {
    return String(n).padStart(3, '0')
  }

  return (
    <StaggerChildren
      as="dl"
      staggerDelay={0.08}
      amount={0.2}
      className={cn(
        'grid grid-cols-2 gap-x-4 gap-y-5 border-t border-gray-100 pt-6 dark:border-gray-100 md:grid-cols-12 md:gap-6',
        className
      )}
    >
      {/* Author */}
      <FadeIn
        as="div"
        className="col-span-2 flex flex-col gap-1.5 md:col-span-4"
      >
        <dt className="font-heading text-label uppercase tracking-[0.14em] text-black/70 dark:text-foreground/70">
          Written by
        </dt>
        <dd className="flex items-center gap-2.5 font-heading text-[15px] tracking-[-0.01em] text-black dark:text-foreground">
          <span
            aria-hidden="true"
            className="inline-flex size-9 shrink-0 items-center justify-center bg-black font-heading text-[12px] font-bold text-white dark:bg-foreground dark:text-background"
          >
            {authorInitials}
          </span>
          {authorName}
        </dd>
      </FadeIn>

      {/* Published */}
      {dateLabel && (
        <FadeIn as="div" className="flex flex-col gap-1.5 md:col-span-2">
          <dt className="font-heading text-label uppercase tracking-[0.14em] text-black/70 dark:text-foreground/70">
            Published
          </dt>
          <dd className="font-heading text-[15px] tracking-[-0.01em] text-black dark:text-foreground">
            {dateLabel}
          </dd>
        </FadeIn>
      )}

      {/* Reading time */}
      {readTimeLabel && (
        <FadeIn as="div" className="flex flex-col gap-1.5 md:col-span-2">
          <dt className="font-heading text-label uppercase tracking-[0.14em] text-black/70 dark:text-foreground/70">
            Reading time
          </dt>
          <dd className="font-heading text-[15px] tracking-[-0.01em] text-black dark:text-foreground">
            {readTimeLabel}
          </dd>
        </FadeIn>
      )}

      {/* Topics */}
      {topicsLabel && (
        <FadeIn as="div" className="flex flex-col gap-1.5 md:col-span-2">
          <dt className="font-heading text-label uppercase tracking-[0.14em] text-black/70 dark:text-foreground/70">
            Topics
          </dt>
          <dd className="font-heading text-[15px] tracking-[-0.01em] text-black dark:text-foreground">
            {topicsLabel}
          </dd>
        </FadeIn>
      )}

      {/* Edition */}
      {editionLabel && (
        <FadeIn as="div" className="flex flex-col gap-1.5 md:col-span-2">
          <dt className="font-heading text-label uppercase tracking-[0.14em] text-black/70 dark:text-foreground/70">
            Edition
          </dt>
          <dd className="font-heading text-[15px] tracking-[-0.01em] text-black dark:text-foreground">
            {editionLabel}
          </dd>
        </FadeIn>
      )}
    </StaggerChildren>
  )
}

export default ArticleMeta
export { ArticleMeta }
