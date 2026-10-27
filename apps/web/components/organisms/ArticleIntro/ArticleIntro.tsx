import React from 'react'
import type { ArticleIntroProps as ArticleIntroSharedProps } from '@portfolio/types/components'
import { cn } from '@/utils/cn'
import { ComponentLayout } from '@/components/hoc/ComponentLayout'
import ArticleMeta from '@/components/molecules/ArticleMeta/ArticleMeta'
import Breadcrumbs from '@/components/molecules/Breadcrumbs/Breadcrumbs'
import { FadeIn } from '@/components/animation/FadeIn/FadeIn'

export interface ArticleIntroProps extends ArticleIntroSharedProps {
  className?: string
}

const ArticleIntro: React.FC<ArticleIntroProps> = ({
  slug,
  title,
  dateLabel,
  publishedYear,
  readTimeLabel,
  tags,
  deck,
  editionNumber,
  author,
  className,
}) => {
  const headline = title?.trim()
  // Without a slug there is no hierarchy to show. Skip the wrapper entirely
  // rather than leaving an empty animated cell in the hero grid.
  const hasBreadcrumbs = Boolean(slug?.trim())

  return (
    <ComponentLayout
      data-organism="article-intro"
      className={cn('bg-background text-black dark:text-foreground', className)}
      contentClassName="gap-y-4 md:gap-y-6"
    >
      {/* Breadcrumbs — the article's real position in the site hierarchy.
          Tags and edition number live in ArticleMeta below. */}
      {hasBreadcrumbs && (
        <FadeIn
          as="div"
          duration={0.6}
          delay={0}
          viewport={{ once: true, amount: 0.3 }}
          className="md:col-span-12"
        >
          <Breadcrumbs
            slug={slug}
            currentLabel={headline}
            className="font-heading text-label uppercase tracking-[0.12em]"
          />
        </FadeIn>
      )}

      {/* Title */}
      {headline && (
        <FadeIn
          as="h1"
          duration={0.6}
          delay={0.1}
          viewport={{ once: true, amount: 0.3 }}
          className="text-display-lg md:col-span-12 max-w-[25ch] font-heading font-normal leading-[0.96] tracking-[-0.035em] text-balance text-black dark:text-foreground"
        >
          {headline}
        </FadeIn>
      )}

      {/* Deck */}
      {deck && (
        <FadeIn
          as="p"
          duration={0.6}
          delay={0.2}
          viewport={{ once: true, amount: 0.3 }}
          className="md:col-span-12 max-w-[56ch] text-body-xl font-body leading-[1.45] text-black/78 dark:text-foreground/80"
        >
          {deck}
        </FadeIn>
      )}

      {/* Meta — desktop only; mobile instance is rendered in ArticleContent */}
      <FadeIn
        duration={0.6}
        delay={0.3}
        viewport={{ once: true, amount: 0.3 }}
        className="md:col-span-12 hidden md:block"
      >
        <ArticleMeta
          author={author}
          dateLabel={dateLabel}
          publishedYear={publishedYear}
          readTimeLabel={readTimeLabel}
          tags={tags}
          editionNumber={editionNumber}
        />
      </FadeIn>
    </ComponentLayout>
  )
}

export default ArticleIntro
export { ArticleIntro }
