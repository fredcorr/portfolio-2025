import type { JournalsListingComponent } from '@portfolio/types/components'
import { locale as rootLocale } from 'next/root-params'
import { isLocale } from '@portfolio/utils/locale'
import { DEFAULT_LOCALE } from '@portfolio/types/base'
import { ComponentLayout } from '@/components/hoc/ComponentLayout'
import { toHeadingTag } from '@/components/atoms/Heading/Heading'
import JournalsListingClient from '@/components/hoc/JournalsListingClient'
import { makeComponentId } from '@/utils/makeComponentId'
import { toListingArticle } from '@/utils/to-listing-article'
import { JOURNALS_PAGE_SIZE } from '@/utils/journals-pagination'
import { SlideIn } from '@/components/animation/SlideIn/SlideIn'
import { FadeIn } from '@/components/animation/FadeIn/FadeIn'

export default async function JournalsListing({
  _id,
  _key,
  sectionId,
  componentIndex,
  kicker,
  title,
  initialData,
}: JournalsListingComponent) {
  const headingId = makeComponentId({
    value: _id || _key,
    prefix: 'journals-listing',
  })

  const total = initialData?.total ?? 0
  // The client fetches further pages itself, and client components can't read
  // root params — so the server hands it the page's locale.
  const routeLocale = await rootLocale()
  const locale = isLocale(routeLocale) ? routeLocale : DEFAULT_LOCALE

  return (
    <ComponentLayout
      sectionId={sectionId}
      componentKey={_key}
      componentIndex={componentIndex}
      overflowHidden={false}
      contentClassName="col-span-full flex flex-col"
      aria-labelledby={headingId}
    >
      <div className="grid grid-cols-[1fr_auto] items-end gap-8 border-b border-foreground/10 pb-6 pt-4 md:pb-10">
        <div className="flex flex-col gap-5">
          {kicker && (
            <SlideIn
              delay={0.1}
              as="span"
              className="inline-flex items-center gap-2.5 font-heading text-label uppercase tracking-[0.14em] text-foreground/70 before:block before:size-1.5 before:rounded-full before:bg-foreground/70"
            >
              {kicker}
            </SlideIn>
          )}

          {title?.heading && (
            <SlideIn
              delay={0.2}
              as={toHeadingTag(title.headingLevel)}
              id={headingId}
              className="font-heading text-[clamp(3rem,8vw,7rem)] font-normal leading-[0.95] tracking-[-0.035em] text-balance"
            >
              {title.heading}
            </SlideIn>
          )}
        </div>

        <FadeIn as="p" delay={0.35} className="self-start pt-2 text-right">
          <strong className="block font-heading text-[44px] font-normal leading-none tracking-[-0.03em]">
            {total}
          </strong>
          <span className="font-heading text-label tracking-[0.06em] text-foreground/70">
            entries
          </span>
        </FadeIn>
      </div>

      {initialData && (
        <JournalsListingClient
          initialData={{
            ...initialData,
            articles: initialData.articles.map(toListingArticle),
            totalPages: Math.ceil(
              (initialData.total ?? 0) / JOURNALS_PAGE_SIZE
            ),
          }}
          apiEndpoint="/api/journals"
          locale={locale}
        />
      )}
    </ComponentLayout>
  )
}
