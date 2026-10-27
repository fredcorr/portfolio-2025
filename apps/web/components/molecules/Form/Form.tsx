'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { useTranslations } from 'next-intl'
import { yupResolver } from '@hookform/resolvers/yup'
import type {
  FormComponent,
  FormFieldItem,
} from '@portfolio/types/components/form'
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3'
import Modal from '@/components/molecules/Modal/Modal'
import RenderFormField from '@/components/hoc/RenderFormField'
import { cn } from '@/utils'
import { buildInitialValues, buildValidationSchema } from '@/utils/form-helpers'

export interface FormProps {
  fields?: FormFieldItem[]
  submitLabel?: string
  success?: FormComponent['success']
  error?: FormComponent['error']
  className?: string
  recaptcha?: {
    action: string
  }
}

type FormValues = Record<string, unknown>

export const Form = ({
  fields,
  submitLabel,
  success,
  error,
  className,
  recaptcha,
}: FormProps) => {
  const t = useTranslations('form')
  const { executeRecaptcha } = useGoogleReCaptcha()
  const resolverSchema = buildValidationSchema(fields, {
    required: t('required'),
    invalidEmail: t('invalidEmail'),
    invalidFormat: t('invalidFormat'),
    invalidDate: t('invalidDate'),
    selectOption: t('selectOption'),
  })

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    defaultValues: buildInitialValues(fields),
    resolver: yupResolver(resolverSchema),
  })

  const [status, setStatus] = React.useState<'idle' | 'success' | 'error'>(
    'idle'
  )

  const onSubmit = async (values: FormValues) => {
    try {
      let payload: FormValues = values

      if (recaptcha) {
        if (!executeRecaptcha) {
          throw new Error('reCAPTCHA is unavailable.')
        }
        const token = await executeRecaptcha(recaptcha.action)
        payload = { ...values, recaptchaToken: token }
      }

      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        const message =
          payload?.error || payload?.message || 'Submission failed.'
        throw new Error(message)
      }

      setStatus('success')
      reset()
    } catch (err) {
      console.error('Form submission failed', err)
      setStatus('error')
    }
  }

  const successTitle = success?.title || t('successTitle')
  const successDescription = success?.subtitle

  const errorTitle = error?.title || t('errorTitle')
  const errorDescription = error?.subtitle

  const isModalOpen = status !== 'idle'
  const modalTitle = status === 'error' ? errorTitle : successTitle
  const modalDescription =
    status === 'error' ? errorDescription : successDescription
  const modalVariant = status === 'error' ? 'error' : 'success'

  return (
    <div className={cn('w-full', className)}>
      <form
        className="flex w-full flex-col gap-6"
        onSubmit={handleSubmit(onSubmit)}
      >
        {fields?.map(field => (
          <RenderFormField
            key={field.label}
            field={field}
            register={register}
            control={control}
            errors={errors}
          />
        ))}
        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 inline-flex w-full items-center justify-center bg-black px-6 py-3 font-heading text-body-lg font-semibold text-white transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:cursor-not-allowed disabled:opacity-70 dark:bg-foreground dark:text-background dark:focus-visible:outline-foreground"
        >
          {isSubmitting ? t('submitting') : (submitLabel ?? t('submit'))}
        </button>
      </form>

      <Modal
        isOpen={isModalOpen}
        title={modalTitle}
        description={modalDescription}
        onClose={() => setStatus('idle')}
        variant={modalVariant}
      />
    </div>
  )
}

export default Form
