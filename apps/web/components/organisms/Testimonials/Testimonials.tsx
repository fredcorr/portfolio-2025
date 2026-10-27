'use client'

import { useTranslations } from 'next-intl'
import React, { useState } from 'react'
import 'swiper/css'
import 'swiper/css/effect-creative'
import { A11y, Autoplay, EffectCreative } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import type SwiperType from 'swiper'
import { motion, useReducedMotion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { PortableText } from '@portabletext/react'
import { ComponentLayout } from '@/components/hoc/ComponentLayout'
import { makeComponentId } from '@/utils/makeComponentId'
import { normalizePortableText } from '@/utils/portableText'
import { cn } from '@/utils/cn'
import type { TestimonialsComponent } from '@portfolio/types/components'

type Testimonial = NonNullable<TestimonialsComponent['testimonials']>[number]

interface TestimonialQuoteProps extends Pick<Testimonial, 'subtitle'> {}

/**
 * The quote body, shared by the carousel and the pre-hydration fallback so the
 * two render identically.
 */
const TestimonialQuote = ({ subtitle }: TestimonialQuoteProps) => {
  const quote = normalizePortableText(subtitle || '')

  return (
    <blockquote className="relative font-heading font-normal text-heading-2 leading-[1.2] tracking-[-0.02em] text-background text-balance max-w-[42ch]">
      <span
        aria-hidden="true"
        className="absolute -left-[0.45em] -top-[0.32em] font-bold text-[1.6em] leading-[1] text-background/18 pointer-events-none select-none"
      >
        &ldquo;
      </span>
      {quote.length > 0 && (
        <PortableText
          value={quote}
          components={{
            marks: {
              em: ({ children }) => (
                <em className="not-italic font-normal text-accent-orange">
                  {children}
                </em>
              ),
            },
            block: {
              normal: ({ children }) => <span>{children}</span>,
            },
          }}
        />
      )}
    </blockquote>
  )
}

function getInitials(name?: string): string {
  if (!name) return '??'
  return name
    .split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase()
}

const Testimonials = ({
  _id,
  _key,
  title,
  testimonials,
  sectionId,
  componentIndex,
}: TestimonialsComponent) => {
  const t = useTranslations()
  const list = Array.isArray(testimonials) ? testimonials : []
  const headingId = makeComponentId({
    value: _id || _key,
    prefix: 'testimonials',
  })
  const prefersReduced = useReducedMotion()

  const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null)
  const [activeIdx, setActiveIdx] = useState(0)

  // Swiper is mounted only after hydration. Its Autoplay module reads
  // `new Date()` as soon as it initialises, which Cache Components rejects
  // during prerender (`blocking-prerender-current-time-client`) — and since
  // `modules` always includes Autoplay, disabling the `autoplay` prop is not
  // enough to avoid it.
  //
  // Deferring the mount keeps the page in the static shell. Wrapping the
  // carousel in `<Suspense>` — the other documented fix — would instead make
  // every page carrying testimonials partially dynamic, costing an origin
  // request per visit. The first quote still renders server-side below, so the
  // content stays in the HTML for crawlers and for no-JS visitors.
  const [isMounted, setIsMounted] = useState(false)

  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  const total = list.length
  const isLoop = total > 1

  const creativeTranslate = prefersReduced
    ? ([0, 0, 0] as [number, number, number])
    : undefined

  return (
    <ComponentLayout
      sectionId={sectionId}
      componentKey={_key}
      componentIndex={componentIndex}
      aria-labelledby={headingId}
      className="!bg-primary-700 !text-background"
      contentClassName="gap-y-8 lg:gap-y-10"
    >
      {total === 0 ? (
        <div className="md:col-span-12 border border-dashed border-background/10 bg-background/5 px-6 py-10 text-center font-body text-body-lg text-background/70">
          {t('empty.testimonials')}
        </div>
      ) : (
        <div className="md:col-span-12 flex flex-col gap-y-8 lg:gap-y-10">
          {/* Section header */}
          <header className="flex flex-col gap-4 border-b border-background/12 pb-7">
            <span className="flex items-center gap-3 font-heading text-label tracking-[0.14em] uppercase text-background/70 before:inline-block before:w-1.5 before:h-1.5 before:rounded-full before:bg-background before:opacity-70">
              {t('testimonials.kicker')}
            </span>
            {title?.heading && (
              <h2
                id={headingId}
                className="font-heading font-normal text-display-lg leading-[0.95] tracking-[-0.035em] text-background max-w-[16ch] text-balance"
              >
                {title.heading}
              </h2>
            )}
          </header>

          {/* Counter bar */}
          <div className="flex items-center gap-6 font-heading text-label tracking-[0.14em] uppercase text-background/70">
            <span className="text-background text-[12px] tracking-[0.14em]">
              {String(activeIdx + 1).padStart(2, '0')} /{' '}
              {String(total).padStart(2, '0')}
            </span>
            <span className="flex-1 h-px bg-background/18" />
            <span>{t('testimonials.heading')}</span>
          </div>

          {/* Carousel — server-rendered as a single static quote, upgraded to
              the interactive carousel once hydrated. See isMounted above. */}
          {!isMounted ? (
            <div className="w-full">
              <TestimonialQuote subtitle={list[0]?.subtitle} />
            </div>
          ) : (
            <Swiper
              modules={[Autoplay, A11y, EffectCreative]}
              effect="creative"
              creativeEffect={{
                prev: {
                  opacity: 0,
                  translate: creativeTranslate ?? [0, '-8px', 0],
                },
                next: {
                  opacity: 0,
                  translate: creativeTranslate ?? [0, '10px', 0],
                },
              }}
              speed={prefersReduced ? 120 : 360}
              autoplay={
                isLoop ? { delay: 6000, disableOnInteraction: false } : false
              }
              loop={isLoop}
              onSwiper={setSwiperInstance}
              onSlideChange={s => setActiveIdx(s.realIndex)}
              a11y={{
                prevSlideMessage: t('testimonials.previous'),
                nextSlideMessage: t('testimonials.next'),
              }}
              className="w-full"
            >
              {list.map(({ _key: slideKey, subtitle }) => (
                <SwiperSlide key={slideKey}>
                  <TestimonialQuote subtitle={subtitle} />
                </SwiperSlide>
              ))}
            </Swiper>
          )}

          {/* Footer: author + dots + nav on one row, divider above */}
          <div className="grid grid-cols-1 items-center gap-x-6 gap-y-6 pt-7 border-t border-background/12 md:grid-cols-[auto_1fr_auto]">
            <motion.div
              key={list[activeIdx]?._key ?? activeIdx}
              initial={{ opacity: 0, y: prefersReduced ? 0 : 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: prefersReduced ? 0.12 : 0.32 }}
              className="flex items-center gap-[18px] min-h-[56px]"
            >
              {list[activeIdx]?.author?.name && (
                <>
                  <span
                    aria-hidden="true"
                    className="w-14 h-14 shrink-0 border border-background/25 flex items-center justify-center font-heading font-bold text-base tracking-[0.02em] text-background"
                  >
                    {getInitials(list[activeIdx]?.author?.name)}
                  </span>
                  <span className="flex flex-col gap-1">
                    <span className="font-heading text-heading-5 tracking-[-0.01em] text-background leading-[1.2]">
                      {list[activeIdx]?.author?.name}
                    </span>
                    {list[activeIdx]?.author?.role && (
                      <span className="font-heading text-label tracking-[0.14em] uppercase text-background/70">
                        {list[activeIdx]?.author?.role}
                      </span>
                    )}
                  </span>
                </>
              )}
            </motion.div>

            {isLoop && (
              <div
                className="flex gap-1.5 items-center justify-self-start md:justify-self-end"
                role="tablist"
                aria-label={t('testimonials.select')}
              >
                {list.map((_, i) => (
                  <button
                    key={i}
                    role="tab"
                    aria-selected={i === activeIdx}
                    aria-label={t('testimonials.goTo', {
                      number: String(i + 1),
                    })}
                    onClick={() => swiperInstance?.slideToLoop(i)}
                    className={cn(
                      'h-0.5 rounded-none bg-background transition-all duration-200 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-background',
                      i === activeIdx
                        ? 'w-9 opacity-100'
                        : 'w-[22px] opacity-30'
                    )}
                  />
                ))}
              </div>
            )}

            {isLoop && (
              <div className="flex gap-2 items-center justify-self-start md:justify-self-end">
                <button
                  onClick={() => swiperInstance?.slidePrev()}
                  aria-label={t('testimonials.previous')}
                  className="w-11 h-11 border border-background/18 flex items-center justify-center text-background hover:bg-background/8 hover:border-background/35 active:scale-[0.96] transition-[background-color,border-color,transform] duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-background"
                >
                  <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                </button>
                <button
                  onClick={() => swiperInstance?.slideNext()}
                  aria-label={t('testimonials.next')}
                  className="w-11 h-11 border border-background/18 flex items-center justify-center text-background hover:bg-background/8 hover:border-background/35 active:scale-[0.96] transition-[background-color,border-color,transform] duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-background"
                >
                  <ChevronRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </ComponentLayout>
  )
}

export default Testimonials
