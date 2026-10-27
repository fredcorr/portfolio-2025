import React from 'react'
// import Link from 'next/link' // re-enable with the CTA below
import type {
  ArticleRelatedProps,
  RelatedArticle,
} from '@portfolio/types/components'
import Image from '@/components/atoms/Image/Image'
import Icon from '@/components/atoms/Icon/Icon'
import { buildPageUrl } from '@/utils/slug'
import { getSiteUrl } from '@/utils/get-site-url'
import useFormatDate from '@/utils/use-format-date'
import { cn } from '@/utils/cn'
import { ComponentLayout } from '@/components/hoc/ComponentLayout'

interface Props extends ArticleRelatedProps {
  className?: string
}

function padEdition(n: number): string {
  return String(n).padStart(3, '0')
}

function PostCard({
  article,
  index,
}: {
  article: RelatedArticle
  index: number
}) {
  const slug = article.slug?.current
  const href = slug ? buildPageUrl(getSiteUrl(), slug) : '#'
  const imageUrl = article.heroImage?.asset?.url
  const imageAlt = article.heroImage?.alt || article.title || ''
  const formatDate = useFormatDate()
  const dateStr = formatDate(article._createdAt, {
    year: 'numeric',
    month: 'short',
  })
  const firstTag = article.tags?.[0]
  const editionLabel =
    article.editionNumber != null
      ? `N° ${padEdition(article.editionNumber)}`
      : String(index + 1).padStart(2, '0')

  return (
    <a
      href={href}
      className="group flex flex-col gap-4 text-inherit no-underline transition hover:-translate-y-1"
    >
      {/* Thumbnail */}
      <div className="relative aspect-[1.18/1] overflow-hidden bg-primary-600">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            blurDataURL={article.heroImage?.asset?.metadata?.lqip}
            className="object-cover"
            wrapperClassName="absolute inset-0"
          />
        ) : (
          <div
            className={cn(
              'absolute inset-0',
              index === 0 &&
                'bg-gradient-to-br from-primary-400 to-primary-700',
              index === 1 &&
                'bg-gradient-to-br from-primary-300 to-primary-600',
              index === 2 && 'bg-gradient-to-br from-primary-200 to-primary-500'
            )}
          />
        )}
      </div>

      {/* Copy */}
      <div className="flex flex-col gap-2 px-1.5">
        <span className="font-heading text-label tracking-[0.12em] text-black/70 dark:text-foreground/70">
          {editionLabel}
        </span>
        {article.title && (
          <h3
            className="font-heading font-normal leading-[1.2] tracking-[-0.015em] text-black dark:text-foreground text-balance"
            style={{ fontSize: 'clamp(1.1rem, 1.6vw, 1.35rem)' }}
          >
            {article.title}
          </h3>
        )}
        <span className="flex items-center gap-3 font-heading text-label uppercase tracking-[0.12em] text-black/70 dark:text-foreground/70">
          {firstTag && <span>{firstTag}</span>}
          {firstTag && dateStr && <span>·</span>}
          {dateStr && <span>{dateStr}</span>}
        </span>
      </div>
    </a>
  )
}

const ArticleRelated: React.FC<Props> = ({ relatedArticles, className }) => {
  if (!relatedArticles || relatedArticles.length === 0) return null

  return (
    <ComponentLayout
      data-organism="article-related"
      className={cn(
        'border-b border-gray-100 bg-background dark:border-gray-100',
        className
      )}
    >
      {/* Header */}
      <div className="md:col-span-12 flex flex-wrap items-end justify-between gap-6 border-b border-gray-100 pb-7 dark:border-gray-100">
        <h2
          className="font-heading font-normal leading-none tracking-[-0.025em] text-black dark:text-foreground"
          style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}
        >
          Continue reading
        </h2>
        {/* CTA — hidden until /articles route is ready */}
        {/* <Link
          href="/articles"
          className="inline-flex items-center gap-2 border border-gray-100 px-4 py-2.5 font-heading text-sm text-black transition hover:-translate-y-0.5 dark:border-gray-100 dark:text-foreground"
        >
          All essays
          <Icon name="arrow-up-right" className="size-3.5" />
        </Link> */}
      </div>

      {/* Grid */}
      <div className="md:col-span-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 md:gap-6">
        {relatedArticles.map((article, i) => (
          <PostCard
            key={article.slug?.current ?? i}
            article={article}
            index={i}
          />
        ))}
      </div>
    </ComponentLayout>
  )
}

export default ArticleRelated
export { ArticleRelated }
