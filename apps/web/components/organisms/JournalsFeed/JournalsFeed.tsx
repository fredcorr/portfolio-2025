import type {
  JournalsFeedComponent,
  JournalsFeedArticle,
} from '@portfolio/types/components'
import { ComponentLayout } from '@/components/hoc/ComponentLayout'
import { Heading } from '@/components/atoms/Heading/Heading'
import { makeComponentId } from '@/utils/makeComponentId'
import { getLinkHref } from '@/utils/get-link-href'
import type { DateTimeFormatOptions } from 'next-intl'
import useFormatDate from '@/utils/use-format-date'
import { getReadTimeLabel } from '@/utils/calculate-read-time'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

const DATE_FORMAT: DateTimeFormatOptions = {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
}

interface ProcessedArticle {
  source: JournalsFeedArticle
  num: string
  href: string | undefined
  date: string | undefined
  readTime: string | undefined
  topic: string | undefined
}

const processArticles = (
  articles: JournalsFeedArticle[],
  formatDate: ReturnType<typeof useFormatDate>
): ProcessedArticle[] =>
  articles.map((article, i) => ({
    source: article,
    num: `N° ${(i + 1).toString().padStart(3, '0')}`,
    href: article.slug?.current ? `/${article.slug.current}` : undefined,
    date: formatDate(article._createdAt, DATE_FORMAT),
    readTime: getReadTimeLabel(article.articleContent),
    topic: article.tags?.join(' · '),
  }))

const JournalsFeed = ({
  _id,
  _key,
  sectionId,
  componentIndex,
  kicker,
  title,
  ctaLabel,
  ctaLink,
  articles,
}: JournalsFeedComponent) => {
  const headingId = makeComponentId({
    value: _id || _key,
    prefix: 'journals-feed',
  })

  const ctaHref = getLinkHref(ctaLink)
  const formatDate = useFormatDate()
  const processedArticles = processArticles(articles ?? [], formatDate)

  return (
    <ComponentLayout
      sectionId={sectionId}
      componentKey={_key}
      componentIndex={componentIndex}
      contentClassName="col-span-full flex flex-col gap-y-0"
      aria-labelledby={headingId}
    >
      {/* Section header */}
      <div className="grid grid-cols-[auto_1fr_auto] items-end gap-x-8 border-b-[0.5px] border-foreground/10 pb-7">
        {kicker && (
          <span className="inline-flex items-center gap-3 font-heading text-label uppercase tracking-[0.14em] text-foreground/70 before:block before:size-1.5 before:rounded-full before:bg-foreground before:opacity-70">
            {kicker}
          </span>
        )}

        <span />

        {ctaHref && ctaLabel && (
          <Link
            href={ctaHref}
            className="inline-flex items-center gap-2 rounded-full border border-foreground/15 px-4 py-3 font-heading text-sm text-foreground transition-transform duration-200 hover:-translate-y-0.5 hover:border-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
          >
            {ctaLabel}
            <ArrowUpRight className="size-3.5" aria-hidden="true" />
          </Link>
        )}

        {title?.heading && (
          <Heading
            level={title.headingLevel}
            id={headingId}
            className="col-span-full mt-4 font-heading text-heading-1 font-normal leading-[0.95] tracking-[-0.035em] text-balance"
          >
            {title.heading}
          </Heading>
        )}
      </div>

      {/* Article list */}
      {processedArticles.length ? (
        <ol>
          {processedArticles.map(
            ({ source, num, href, date, readTime, topic }) => {
              const row = (
                <>
                  <p className="font-heading text-label tracking-[0.14em] text-foreground/70">
                    {num}
                  </p>

                  <p className="font-heading text-[clamp(1.25rem,2.4vw,1.75rem)] font-normal leading-snug tracking-tight text-foreground text-balance transition-[letter-spacing] duration-200 ease-out group-hover:tracking-[-0.022em]">
                    {source.title}
                  </p>

                  {topic && (
                    <p className="hidden font-heading text-label uppercase tracking-[0.14em] text-foreground/70 md:block">
                      {topic}
                    </p>
                  )}

                  <div className="hidden text-right md:block">
                    {date && (
                      <p className="font-heading text-sm tracking-[-0.01em] text-foreground">
                        {date}
                      </p>
                    )}
                    {readTime && (
                      <p className="font-heading text-label tracking-[0.04em] text-foreground/70">
                        {readTime}
                      </p>
                    )}
                  </div>

                  <span
                    className="inline-flex size-7 items-center justify-center border border-foreground/15 text-foreground opacity-55 transition-[transform,opacity] duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
                    aria-hidden="true"
                  >
                    <ArrowUpRight className="size-3" />
                  </span>
                </>
              )

              const sharedClassName =
                'group grid grid-cols-[48px_1fr_28px] md:grid-cols-[64px_1fr_200px_140px_28px] items-center gap-4 md:gap-6 border-b-[0.5px] border-foreground/10 py-5 px-3 text-inherit no-underline transition-[background,padding] duration-200 hover:bg-foreground/[0.035] hover:pl-5'

              return href ? (
                <li key={source._id}>
                  <Link href={href} className={sharedClassName}>
                    {row}
                  </Link>
                </li>
              ) : (
                <li key={source._id} className={sharedClassName}>
                  {row}
                </li>
              )
            }
          )}
        </ol>
      ) : (
        <div className="rounded-3xl bg-foreground/5 px-6 py-10 text-foreground/70">
          Articles will appear here once they are published.
        </div>
      )}
    </ComponentLayout>
  )
}

export default JournalsFeed
