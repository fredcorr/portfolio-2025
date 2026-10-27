'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import FocusTrap from 'focus-trap-react'
import { RemoveScroll } from 'react-remove-scroll'
import { cn } from '@/utils/cn'
import RichText, { RichTextSize } from '@/components/atoms/RichText/RichText'
import { Heading } from '@/components/atoms/Heading/Heading'
import type { PortableTextBlock } from '@portabletext/react'

export interface ModalProps {
  isOpen: boolean
  title?: string
  description?: PortableTextBlock[]
  onClose: () => void
  actionLabel?: string
  variant?: 'success' | 'error'
}

export const Modal = ({
  isOpen,
  title,
  description,
  onClose,
  actionLabel,
  variant = 'success',
}: ModalProps) => {
  const t = useTranslations('form')

  if (!isOpen) return null

  const accentClass =
    variant === 'success'
      ? 'bg-status-success text-black dark:text-background'
      : 'bg-status-error text-white dark:text-background'

  return (
    <RemoveScroll>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <FocusTrap
          focusTrapOptions={{
            clickOutsideDeactivates: true,
            escapeDeactivates: true,
            onDeactivate: onClose,
            fallbackFocus: '#modal-title',
          }}
        >
          <div className="w-full max-w-lg bg-white p-6 shadow-xl outline-none dark:bg-background">
            {title && (
              <Heading
                level={2}
                id="modal-title"
                className="mb-3 font-heading text-heading-4 font-semibold text-black dark:text-foreground"
              >
                {title}
              </Heading>
            )}
            {description && description.length > 0 && (
              <div id="modal-description" className="mb-4">
                <RichText
                  value={description}
                  size={RichTextSize.Md}
                  className="text-black/80 dark:text-foreground/80"
                />
              </div>
            )}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className={cn(
                  'inline-flex items-center gap-2 px-4 py-2 font-heading text-body-md font-semibold transition',
                  accentClass,
                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black'
                )}
              >
                {actionLabel ?? t('close')}
              </button>
            </div>
          </div>
        </FocusTrap>
      </div>
    </RemoveScroll>
  )
}

export default Modal
