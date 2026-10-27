'use client'

import type { Locale } from '@portfolio/types/base'
import { useState } from 'react'
import useSWR from 'swr'

import Card from '@/components/molecules/Card/Card'
import Button from '@/components/atoms/Button/Button'
import Select from '@/components/atoms/Select/Select'
import Pagination from '@/components/atoms/Pagination/Pagination'
import SkeletonCard from '@/components/molecules/SkeletonCard/SkeletonCard'
import { StaggerChildren } from '@/components/animation/StaggerChildren/StaggerChildren'
import { FadeInStagger } from '@/components/animation/FadeIn/FadeInStagger'
import type { DateTimeFormatOptions } from 'next-intl'
import useFormatDate from '@/utils/use-format-date'
import { JOURNALS_PAGE_SIZE } from '@/utils/journals-pagination'
import { cn } from '@/utils/cn'
import type {
  JournalsListingArticle,
  JournalsListingData,
} from '@portfolio/types/components'

const DATE_FORMAT: DateTimeFormatOptions = {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
}

interface ApiResponse {
  articles: JournalsListingArticle[]
  total: number
  totalPages: number
}

interface JournalsListingClientProps {
  initialData: JournalsListingData
  apiEndpoint: string
  /** Pages fetched after the first must stay in the listing's language. */
  locale: Locale
}

const fetcher = async (url: string): Promise<ApiResponse> => {
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch')
  return res.json() as Promise<ApiResponse>
}

const buildKey = (
  apiEndpoint: string,
  locale: Locale,
  categories: string[],
  page: number
): string => {
  const params = new URLSearchParams({ page: String(page), locale })
  if (categories.length > 0) params.set('categories', categories.join(','))
  return `${apiEndpoint}?${params.toString()}`
}

const articleToCardProps = (
  article: JournalsListingArticle,
  index: number,
  formatDate: ReturnType<typeof useFormatDate>
) => ({
  href: article.slug?.current ? `/${article.slug.current}` : undefined,
  title: article.title,
  image: article.cardImage,
  imageAspectClassName: 'aspect-[3/2]',
  indexLabel:
    article.editionNumber != null
      ? `N° ${String(article.editionNumber).padStart(3, '0')}`
      : undefined,
  tag: article.tags?.[0],
  footerDate: formatDate(article._createdAt, DATE_FORMAT),
  footerReadTime: article.readTime ?? undefined,
  priority: index < 3,
  className:
    'hover:-translate-y-[3px] hover:shadow-[0_12px_32px_rgba(0,0,0,0.09)]',
})

const JournalsListingClient = ({
  initialData,
  apiEndpoint,
  locale,
}: JournalsListingClientProps) => {
  const formatDate = useFormatDate()
  const [activeCategories, setActiveCategories] = useState<string[]>([])
  const [page, setPage] = useState(1)

  const isInitialState = activeCategories.length === 0 && page === 1

  const { data, error, isLoading, mutate } = useSWR<ApiResponse>(
    isInitialState
      ? null
      : buildKey(apiEndpoint, locale, activeCategories, page),
    fetcher
  )

  const removeCategory = (cat: string) => {
    setActiveCategories(prev => prev.filter(c => c !== cat))
    setPage(1)
  }

  const categoryCounts = initialData.allTags.reduce<Record<string, number>>(
    (acc, tag) => {
      acc[tag] = (acc[tag] ?? 0) + 1
      return acc
    },
    {}
  )

  const categoryOptions = initialData.categories.map(cat => ({
    value: cat,
    label: cat,
    count: categoryCounts[cat] ?? 0,
  }))

  const articles = isInitialState
    ? initialData.articles
    : (data?.articles ?? [])
  const totalPages = isInitialState
    ? initialData.totalPages
    : (data?.totalPages ?? 0)
  const showSkeleton = !isInitialState && isLoading

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div>
      {/* Filter: react-select control + chips rendered outside the control */}
      <nav
        className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-foreground/10 py-4"
        aria-label="Filter by topic"
      >
        <Select
          isMulti
          options={categoryOptions}
          value={activeCategories}
          onChange={values => {
            setActiveCategories(values)
            setPage(1)
          }}
          placeholder="Filter by Topic"
          instanceId="journal-topic-filter"
          aria-label="Filter by topic"
          controlShouldRenderValue={false}
          hideSelectedOptions={false}
          closeMenuOnSelect={false}
          wrapperClassName="w-auto"
          controlClassName="min-w-[16rem] border-foreground/15 bg-transparent px-3 py-2"
        />

        {activeCategories.map(cat => (
          <button
            key={cat}
            onClick={() => removeCategory(cat)}
            aria-label={`Remove ${cat} filter`}
            className={cn(
              'relative py-2 font-heading text-body-md uppercase tracking-[0.14em] text-foreground',
              'transition-colors hover:text-foreground/70',
              'after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-foreground'
            )}
          >
            {cat}
            <span aria-hidden="true" className="ml-1.5">
              ×
            </span>
          </button>
        ))}
      </nav>

      {/* Grid */}
      <div className="py-12">
        {showSkeleton ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: JOURNALS_PAGE_SIZE }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-start gap-4 py-20">
            <p className="font-heading text-foreground/70">
              Couldn&apos;t load articles — try again.
            </p>
            <Button variant="outline" onClick={() => void mutate()}>
              Retry
            </Button>
          </div>
        ) : articles.length === 0 ? (
          <p className="py-20 font-heading text-[clamp(1.5rem,3vw,2.5rem)] font-normal tracking-[-0.02em] text-foreground/70">
            No entries in this category yet.
          </p>
        ) : (
          <StaggerChildren
            as="div"
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            staggerDelay={0.05}
            amount={0.1}
          >
            {articles.map((article, i) => (
              <Card
                key={article._id}
                {...articleToCardProps(article, i, formatDate)}
                AnimationComponent={FadeInStagger}
              />
            ))}
          </StaggerChildren>
        )}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        className="pb-16"
      />
    </div>
  )
}

export default JournalsListingClient
