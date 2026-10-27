'use client'

import { useEffect } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import * as CookieConsent from 'vanilla-cookieconsent'
import { updateAnalyticsConsent } from '@/utils/consent-mode'

export default function CookieBanner() {
  const t = useTranslations('cookies')
  const locale = useLocale()

  useEffect(() => {
    CookieConsent.run({
      categories: {
        necessary: {
          enabled: true,
          readOnly: true,
        },
        analytics: {
          enabled: false,
          autoClear: {
            cookies: [{ name: /^(_ga|_gid|_gat)/ }],
          },
        },
      },
      // One translation, for the page's own language. Switching language is
      // a full page load (it changes the root layout), so the banner always
      // starts again in the right one.
      language: {
        default: locale,
        translations: {
          [locale]: {
            consentModal: {
              title: t('title'),
              description: t('description'),
              acceptAllBtn: t('acceptAll'),
              acceptNecessaryBtn: t('rejectAll'),
              showPreferencesBtn: t('managePreferences'),
            },
            preferencesModal: {
              title: t('preferencesTitle'),
              acceptAllBtn: t('acceptAll'),
              acceptNecessaryBtn: t('rejectAll'),
              savePreferencesBtn: t('savePreferences'),
              closeIconLabel: t('close'),
              sections: [
                {
                  title: t('essentialTitle'),
                  description: t('essentialDescription'),
                  linkedCategory: 'necessary',
                },
                {
                  title: t('analyticsTitle'),
                  description: t('analyticsDescription'),
                  linkedCategory: 'analytics',
                },
              ],
            },
          },
        },
      },
      guiOptions: {
        consentModal: {
          layout: 'bar',
          position: 'bottom',
          equalWeightButtons: false,
          flipButtons: false,
        },
        preferencesModal: {
          layout: 'box',
          position: 'right',
          equalWeightButtons: false,
          flipButtons: false,
        },
      },
      onConsent: () => {
        updateAnalyticsConsent(CookieConsent.acceptedCategory('analytics'))
      },
      onChange: () => {
        updateAnalyticsConsent(CookieConsent.acceptedCategory('analytics'))
      },
    })
  }, [locale, t])

  return null
}
