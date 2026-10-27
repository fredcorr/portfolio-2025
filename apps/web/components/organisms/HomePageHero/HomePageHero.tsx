import { getTranslations } from 'next-intl/server'
import type { HomePageHeroComponent } from '@portfolio/types/components'
import { ComponentLayout } from '@/components/hoc/ComponentLayout'
import OverlapAnimation from '@/components/hoc/OverlapAnimation'
import getSettings from '@/utils/get-settings'
import { DEFAULT_LOCALE } from '@portfolio/types/base'
import Icon from '@/components/atoms/Icon/Icon'
import { ThreeBackgroundTunnel } from '@/components/molecules/lazy-backgrounds'
import { FadeIn } from '@/components/animation/FadeIn/FadeIn'
import { SlideIn } from '@/components/animation/SlideIn/SlideIn'

interface HomePageHeroProps extends HomePageHeroComponent {
  scrollTargetId?: string
}

export const HomePageHero = async ({
  title,
  subtitle,
  getInTouchTitle,
  _key,
  sectionId,
  componentIndex,
  scrollTargetId,
}: HomePageHeroProps) => {
  // Only the contact email is read, and it is shared by every locale, so the
  // default locale's (already cached) settings entry serves every page.
  const { settings } = await getSettings(DEFAULT_LOCALE)
  const t = await getTranslations('hero')
  const headline = title?.trim()
  const supportingCopy = subtitle?.trim()
  const contactLabel = getInTouchTitle?.trim()
  const contactEmail = settings?.email
  const ctaTarget = scrollTargetId?.trim() || 'main-content'

  return (
    <ComponentLayout
      sectionId={sectionId}
      componentKey={_key}
      componentIndex={componentIndex}
      overflowHidden={false}
      className="!py-0 z-0"
      contentClassName="gap-0 px-0"
    >
      <div className="md:col-span-12">
        <OverlapAnimation>
          <div
            id="hero-bg"
            className="pointer-events-none absolute left-1/2 -top-20 bottom-0 z-0 w-screen -translate-x-1/2 md:-top-24"
          >
            <div className="flex h-full w-full flex-col md:flex-row">
              <div className="flex-1 bg-foreground">
                <ThreeBackgroundTunnel className="absolute inset-0" />
              </div>
              <div className="flex-1 bg-surface-1" />
            </div>
          </div>

          <div className="relative z-10 lg:-mt-20" id="hero-content">
            <div className="grid min-h-screen grid-cols-1 grid-rows-2 items-stretch md:grid-cols-12 md:grid-rows-1">
              <div className="relative flex h-full items-end justify-start overflow-hidden pb-10 md:col-span-6 md:items-center md:pb-0">
                <div className="relative z-10 max-w-xl text-background">
                  {headline && (
                    <FadeIn
                      as="h1"
                      delay={0.25}
                      className="text-display-2xl lg:font-display md:text-[clamp(3rem,8vw,7rem)] leading-[0.95] tracking-tight"
                    >
                      {headline}
                    </FadeIn>
                  )}
                  <SlideIn
                    delay={0.35}
                    className="mt-8 mb-8 flex items-center gap-3"
                  >
                    <span className="font-heading text-sm uppercase tracking-wider">
                      {t('scroll')}
                    </span>
                    <a
                      href={`#${ctaTarget}`}
                      className="inline-flex size-8 items-center justify-center border border-background/20 transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-background"
                      aria-label={t('scrollLabel')}
                    >
                      <Icon
                        name="arrow-down"
                        className="size-4 text-background"
                      />
                    </a>
                  </SlideIn>
                </div>
              </div>

              <div className="flex h-full justify-start md:justify-end pt-10 md:col-span-6 md:items-center md:pt-0">
                <SlideIn
                  delay={0.35}
                  className="space-y-12 md:max-w-md md:px-6 lg:max-w-xl"
                >
                  {supportingCopy && (
                    <p className="font-body text-body-lg leading-relaxed md:text-body-xl">
                      {supportingCopy}
                    </p>
                  )}

                  {(contactLabel || contactEmail) && (
                    <div className="border-t border-foreground/10 pt-8">
                      {contactLabel && (
                        <p className="font-heading text-sm uppercase tracking-wider text-foreground/70">
                          {contactLabel}
                        </p>
                      )}
                      {contactEmail && (
                        <a
                          href={`mailto:${contactEmail}`}
                          className="mt-2 inline-flex font-body text-body-lg text-foreground transition hover:opacity-70 md:text-body-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
                        >
                          {contactEmail}
                        </a>
                      )}
                    </div>
                  )}
                </SlideIn>
              </div>
            </div>
          </div>
        </OverlapAnimation>
      </div>
    </ComponentLayout>
  )
}
