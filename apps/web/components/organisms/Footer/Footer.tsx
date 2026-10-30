'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import * as CookieConsent from 'vanilla-cookieconsent'
import type { FooterProps } from '@portfolio/types/components'
import Button from '@/components/atoms/Button/Button'
import Icon from '@/components/atoms/Icon/Icon'
import { cn } from '@/utils/cn'
import getLinkHref from '@/utils/get-link-href'

const Footer: React.FC<FooterProps> = ({
  email,
  socialLinks,
  navigationItems,
  openForProjects,
  availabilityText,
  year,
  className,
}) => {
  const t = useTranslations('footer')
  const hasEmail = Boolean(email)
  const hasSocialLinks = Boolean(socialLinks?.length)
  const hasNavItems = Boolean(navigationItems?.length)
  const availabilityLabel = availabilityText
    ? t('availableUntil', { availability: availabilityText })
    : t('available')

  return (
    <footer
      className={cn(
        'w-full overflow-hidden bg-[#050505] px-4 text-[#f5f5f5] dark:bg-[#0a0909] md:px-10',
        className
      )}
    >
      <div className="mx-auto w-full max-w-[1440px]">
        {/* ── Head: kicker + heading ← → email pill ─────────────── */}
        <div
          className={cn(
            'grid grid-cols-1 items-end gap-8 pt-16 pb-12',
            'md:grid-cols-[1fr_auto] md:pt-24 md:pb-20'
          )}
        >
          <div className="flex flex-col gap-5">
            {openForProjects && (
              <span className="inline-flex items-center gap-2.5 font-heading text-label uppercase tracking-[0.14em] text-[rgba(245,245,245,0.7)]">
                <span className="size-[7px] rounded-full bg-status-success shadow-[0_0_0_4px_rgba(41,174,41,0.18)]" />
                {availabilityLabel}
              </span>
            )}
            <h2 className="max-w-[18ch] font-heading text-heading-1 font-normal leading-[1.02] tracking-[-0.035em] text-[#f5f5f5] xl:text-[clamp(2.25rem,5vw,4rem)]">
              {t.rich('heading', {
                em: chunks => <em className="not-italic">{chunks}</em>,
              })}
            </h2>
          </div>

          {hasEmail && (
            <a
              href={`mailto:${email}`}
              aria-label={t('emailLabel', { email: email ?? '' })}
              className={cn(
                'inline-flex items-center gap-3 bg-[#f5f5f5] px-[22px] py-4 text-[#0a0909]',
                'font-heading text-[15px] tracking-[-0.005em] whitespace-nowrap',
                'transition hover:-translate-y-0.5',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f5f5f5]'
              )}
            >
              {email}
              <Icon
                name="arrow-up-right"
                className="size-3.5"
                title={t('sendEmail')}
              />
            </a>
          )}
        </div>

        {/* ── Link columns: Sitemap + Elsewhere ─────────────────── */}
        {(hasNavItems || hasSocialLinks) && (
          <div className="grid grid-cols-1 gap-8 pb-10 sm:grid-cols-2 md:gap-16 xl:grid-cols-3 xl:pb-14">
            {hasNavItems && (
              <div className="flex flex-col gap-4">
                <span className="font-heading text-label uppercase tracking-[0.18em] text-[rgba(245,245,245,0.7)]">
                  {t('sitemap')}
                </span>
                <ul className="flex flex-col gap-2.5">
                  {navigationItems?.map(item => (
                    <li key={item._id}>
                      <a
                        href={`/${item.slug.current}`}
                        className="font-heading text-[15px] tracking-[-0.005em] text-[#f5f5f5] transition hover:opacity-55 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f5f5f5]"
                      >
                        {item.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {hasSocialLinks && (
              <div className="flex flex-col gap-4">
                <span className="font-heading text-label uppercase tracking-[0.18em] text-[rgba(245,245,245,0.7)]">
                  {t('elsewhere')}
                </span>
                <ul className="flex flex-col gap-2.5">
                  {socialLinks?.map((link, index) => {
                    const href = getLinkHref(link)
                    const label =
                      link?.name || link?.internal_ref?.title || link?.url
                    const linkKey =
                      link?.internal_ref?._id ||
                      link?.url ||
                      link?.name ||
                      `footer-social-${index}`
                    const isExternal = Boolean(href?.startsWith('http'))

                    return href && label ? (
                      <li key={linkKey}>
                        <a
                          href={href}
                          className="inline-flex items-center gap-1.5 font-heading text-[15px] tracking-[-0.005em] text-[#f5f5f5] transition hover:opacity-55 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f5f5f5]"
                          {...(isExternal && {
                            target: '_blank',
                            rel: 'noreferrer',
                          })}
                        >
                          {label}
                          {isExternal && (
                            <span className="text-label opacity-50">↗</span>
                          )}
                        </a>
                      </li>
                    ) : null
                  })}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* ── Rail ──────────────────────────────────────────────── */}
        <div
          className={cn(
            'grid grid-cols-1 items-center gap-3 border-t border-[rgba(245,245,245,0.12)] py-6 pb-9',
            'font-heading text-[12px] tracking-[0.02em] text-[rgba(245,245,245,0.7)]',
            'md:grid-cols-[1fr_auto] md:gap-6'
          )}
        >
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <span>{t('rail', { year: String(year) })}</span>
            <Button
              type="button"
              onClick={() => CookieConsent.showPreferences()}
              className="p-0 text-[12px] normal-case tracking-[0.02em] text-[#f5f5f5] transition hover:text-[#f5f5f5] hover:opacity-55 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f5f5f5]"
            >
              {t('cookieSettings')}
            </Button>
          </div>
          <a
            href="#main-content"
            className="text-[#f5f5f5] transition hover:opacity-55 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f5f5f5] md:justify-self-end"
          >
            {t('backToTop')}
          </a>
        </div>
      </div>
    </footer>
  )
}

export default Footer
