import { useTranslations } from 'next-intl'
import React from 'react'
import type { AboutPageHeroComponent } from '@portfolio/types/components'
import { ComponentLayout } from '@/components/hoc/ComponentLayout'
import { toHeadingTag } from '@/components/atoms/Heading/Heading'
import RichText, { RichTextSize } from '@/components/atoms/RichText/RichText'
import { makeComponentId } from '@/utils/makeComponentId'
import { getContactEmail } from '@/utils/get-contact-email'
import Icon from '@/components/atoms/Icon/Icon'
import OverlapAnimation from '@/components/hoc/OverlapAnimation'
import { AboutBackgroundHelixPulseCascade } from '@/components/molecules/lazy-backgrounds'
import { SlideDirection, SlideIn } from '@/components/animation/SlideIn/SlideIn'
import { FadeIn } from '@/components/animation/FadeIn/FadeIn'

const AboutPageHero = ({
  _id,
  _key,
  title,
  body,
  bodySecondary,
  location,
  timezone,
  languages,
  resumeUrl,
  showCta,
  sectionId,
  componentIndex,
}: AboutPageHeroComponent) => {
  const t = useTranslations('hero')
  const headingId = makeComponentId({
    value: _id || _key,
    prefix: 'about-hero',
  })
  const headline = title?.heading?.trim()
  const headingLevel = title?.headingLevel
  const resolvedResumeUrl = resumeUrl?.trim()
  const contactEmail = getContactEmail()
  const ctaLabel = resolvedResumeUrl ? t('resume') : contactEmail
  const ctaHref = resolvedResumeUrl || `mailto:${contactEmail}`
  const ctaIconTitle = resolvedResumeUrl ? t('resumeIcon') : t('emailIcon')
  const metaItems = [location, timezone, languages].filter(Boolean)

  return (
    <ComponentLayout
      sectionId={sectionId}
      componentKey={_key}
      componentIndex={componentIndex}
      aria-labelledby={headingId}
      className="bg-foreground text-background !py-0 z-0"
      contentClassName="gap-0 px-0"
      overflowHidden={false}
    >
      <div className="md:col-span-12">
        <OverlapAnimation>
          <div className="pointer-events-none absolute left-1/2 h-full -top-24 bottom-0 z-0 w-screen -translate-x-1/2 before:absolute before:inset-0 before:content-[''] before:bg-foreground">
            <AboutBackgroundHelixPulseCascade className="absolute inset-0 z-10" />
          </div>
          <div className="relative z-10">
            <div className="grid min-h-screen grid-cols-1 content-center gap-y-5 pb-16 md:grid-cols-12 md:gap-y-10 md:pb-24">
              <div className="relative md:col-span-12">
                <div className="absolute -left-4 top-0 bottom-0 hidden w-[4px] md:block md:-left-12">
                  <div className="h-full w-full bg-gradient-to-b from-transparent via-background to-transparent opacity-70" />
                </div>
                {headline && (
                  <SlideIn
                    id={headingId}
                    key="headline"
                    delay={0.25}
                    as={toHeadingTag(headingLevel)}
                    className="font-heading tracking-tight whitespace-pre-line text-[clamp(7rem,25vw,20rem)] md:text-[clamp(15rem,13vw,20rem)] leading-[0.85]"
                  >
                    {headline}
                  </SlideIn>
                )}
                {metaItems.length > 0 && (
                  <SlideIn
                    delay={0.5}
                    key="meta"
                    as="div"
                    direction={SlideDirection.Left}
                    className="mt-8 flex flex-wrap items-center gap-3 text-sm text-background/70 md:mt-12 md:gap-4 md:text-base"
                  >
                    {location && (
                      <div className="flex items-center gap-2">
                        <span className="size-2 bg-green-500 animate-pulse" />
                        <span>{location}</span>
                      </div>
                    )}
                    {timezone && (
                      <>
                        {location && <span className="opacity-50">•</span>}
                        <span>{timezone}</span>
                      </>
                    )}
                    {languages && (
                      <>
                        {(location || timezone) && (
                          <span className="opacity-50">•</span>
                        )}
                        <span>{languages}</span>
                      </>
                    )}
                  </SlideIn>
                )}
              </div>

              <FadeIn as="div" delay={0.65} className="space-y-6 md:col-span-8">
                {body && (
                  <RichText
                    value={body}
                    size={RichTextSize.Xl}
                    className="space-y-4 text-background/80 md:pr-6"
                  />
                )}
              </FadeIn>

              <FadeIn as="div" delay={0.7} className="space-y-6 md:col-span-4">
                {bodySecondary && (
                  <RichText
                    value={bodySecondary}
                    size={RichTextSize.Md}
                    className="space-y-4 text-background/80"
                  />
                )}

                {showCta && (
                  <a
                    href={ctaHref}
                    download={resolvedResumeUrl ? '' : undefined}
                    className="inline-flex items-center gap-2 text-heading-4 font-heading text-background underline underline-offset-4 transition hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-background"
                  >
                    {ctaLabel}
                    <Icon
                      name="arrow-up-right"
                      className="size-5"
                      title={ctaIconTitle}
                    />
                  </a>
                )}
              </FadeIn>
            </div>
          </div>
        </OverlapAnimation>
      </div>
    </ComponentLayout>
  )
}

export default AboutPageHero
export { AboutPageHero }
