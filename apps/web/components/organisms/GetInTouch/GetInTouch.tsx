'use client'

import React from 'react'
import type { FormComponent } from '@portfolio/types/components'
import { ComponentLayout } from '@/components/hoc/ComponentLayout'
import { toHeadingTag } from '@/components/atoms/Heading/Heading'
import RichText, { RichTextSize } from '@/components/atoms/RichText/RichText'
import Form from '@/components/molecules/Form/Form'
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3'
import { makeComponentId } from '@/utils/makeComponentId'
import { normalizePortableText } from '@/utils/portableText'
import { FadeIn } from '@/components/animation/FadeIn/FadeIn'

const GetInTouch = ({
  _id,
  _key,
  title,
  subtitle,
  formFields,
  success,
  error,
  sectionId,
  componentIndex,
}: FormComponent) => {
  const headingId = makeComponentId({
    value: _id || _key,
    prefix: 'get-in-touch',
  })
  const subtitleBlocks = normalizePortableText(subtitle as string | undefined)
  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
  const recaptchaConfig = recaptchaSiteKey
    ? { action: 'contact_form' }
    : undefined

  return (
    <ComponentLayout
      sectionId={sectionId}
      componentKey={_key}
      componentIndex={componentIndex}
      aria-labelledby={headingId}
      className="text-black dark:text-foreground"
      contentClassName="gap-y-12 lg:gap-y-18"
    >
      <div className="md:col-span-12 flex flex-col items-center gap-4 text-center">
        {title?.heading && (
          <FadeIn
            id={headingId}
            as={toHeadingTag(title?.headingLevel)}
            className="max-w-3xl font-heading text-heading-1 leading-[1.1] tracking-tight"
          >
            {title.heading}
          </FadeIn>
        )}
        {subtitleBlocks.length > 0 && (
          <RichText
            value={subtitleBlocks}
            size={RichTextSize.Xl}
            className="max-w-2xl text-center text-black/80 dark:text-foreground/80"
          />
        )}
      </div>

      {recaptchaSiteKey ? (
        <GoogleReCaptchaProvider
          reCaptchaKey={recaptchaSiteKey}
          scriptProps={{ async: true, defer: true, appendTo: 'head' }}
        >
          <Form
            fields={formFields}
            success={success}
            error={error}
            recaptcha={recaptchaConfig}
            className="max-w-2xl md:col-span-12 flex justify-center justify-self-center"
          />
        </GoogleReCaptchaProvider>
      ) : (
        <Form
          fields={formFields}
          success={success}
          error={error}
          recaptcha={recaptchaConfig}
          className="max-w-2xl md:col-span-12 flex justify-center justify-self-center"
        />
      )}
    </ComponentLayout>
  )
}

export default GetInTouch
export { GetInTouch }
