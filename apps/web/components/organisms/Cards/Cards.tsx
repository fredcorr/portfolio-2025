import { useTranslations } from 'next-intl'
import RichText, { RichTextSize } from '@/components/atoms/RichText/RichText'
import { ComponentLayout } from '@/components/hoc/ComponentLayout'
import { Heading, toHeadingTag } from '@/components/atoms/Heading/Heading'
import { makeComponentId } from '@/utils/makeComponentId'
import Card from '@/components/molecules/Card/Card'
import { cn } from '@/utils/cn'
import type { CardsComponent } from '@portfolio/types/components'
import { StaggerChildren } from '@/components/animation/StaggerChildren/StaggerChildren'
import { FadeIn } from '@/components/animation/FadeIn/FadeIn'

const Cards = ({
  _id,
  _key,
  title,
  subtitle,
  items,
  sectionId,
  componentIndex,
}: CardsComponent) => {
  const t = useTranslations()
  const headingId = makeComponentId({ value: _id || _key, prefix: 'cards' })
  const hasItems = Array.isArray(items) && items.length > 0
  const itemsList = hasItems ? items : []

  return (
    <ComponentLayout
      sectionId={sectionId}
      componentKey={_key}
      componentIndex={componentIndex}
      aria-labelledby={headingId}
      className="text-black dark:text-foreground"
      contentClassName="gap-y-10 lg:gap-y-14"
    >
      {(title?.heading || subtitle) && (
        <div className="md:col-span-12">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            {title?.heading && (
              <FadeIn
                delay={0.25}
                id={headingId}
                as={toHeadingTag(title.headingLevel)}
                className="font-heading text-heading-2 leading-[1.1] tracking-tight"
              >
                {title.heading}
              </FadeIn>
            )}
            {subtitle && (
              <RichText
                value={subtitle}
                size={RichTextSize.Lg}
                className={cn(
                  'max-w-2xl text-black/70 dark:text-foreground/80',
                  !title?.heading && 'md:ml-auto'
                )}
              />
            )}
          </div>
        </div>
      )}

      {hasItems && (
        <StaggerChildren
          staggerDelay={0.25}
          className="md:col-span-12 grid grid-cols-1 gap-6 md:grid-cols-2"
        >
          {itemsList.map((item, index) => (
            <Card
              key={item._key ?? `card-${index}`}
              title={`• ${item.title || t('media.cardFallbackTitle', { number: String(index + 1) })}`}
              subtitle={item.subtitle}
              subtitleSize={RichTextSize.Lg}
              as="li"
              className="h-full pr-4"
              AnimationComponent={FadeIn}
            />
          ))}
        </StaggerChildren>
      )}

      {!hasItems && (
        <div className="md:col-span-12 border border-dashed border-black/10 bg-gray-50 px-6 py-10 text-center font-body text-body-lg text-black/70 dark:border-gray-200/40 dark:bg-gray-100 dark:text-foreground/70">
          {t('empty.cards')}
        </div>
      )}
    </ComponentLayout>
  )
}

export default Cards
