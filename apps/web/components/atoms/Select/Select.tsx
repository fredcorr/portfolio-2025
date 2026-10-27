'use client'

import { useTranslations } from 'next-intl'
import React from 'react'
import ReactSelect, {
  type ClassNamesConfig,
  type PropsValue,
} from 'react-select'
import { cn } from '@/utils/cn'

export interface SelectOption {
  value: string
  label: string
  /** Optional right-aligned meta shown in the menu (e.g. a result count). */
  count?: number
}

interface BaseSelectProps {
  options: SelectOption[]
  label?: string
  error?: string
  required?: boolean
  placeholder?: string
  name?: string
  id?: string
  /** Stable id to keep SSR/CSR markup aligned. Defaults to id/name. */
  instanceId?: string
  disabled?: boolean
  isClearable?: boolean
  isSearchable?: boolean
  wrapperClassName?: string
  /** Extra classes merged onto the control (e.g. a lighter filter trigger). */
  controlClassName?: string
  // react-select passthroughs the multi-select filter relies on
  controlShouldRenderValue?: boolean
  hideSelectedOptions?: boolean
  closeMenuOnSelect?: boolean
  'aria-label'?: string
}

export type SelectProps =
  | (BaseSelectProps & {
      isMulti?: false
      value?: string
      onChange?: (value: string) => void
    })
  | (BaseSelectProps & {
      isMulti: true
      value?: string[]
      onChange?: (values: string[]) => void
    })

/**
 * `react-select`-powered select atom with a string-based API.
 *
 * - Single-select renders as a styled form field (label + optional error),
 *   driven by a `string` value — used by `RenderFormField` via RHF `Controller`.
 * - Pass `isMulti` for a `string[]` multi-select (used by the journals filter).
 *
 * Styled via `unstyled` + `classNames` with design tokens, so it carries
 * light/dark automatically and keeps react-select's combobox a11y (keyboard
 * nav, type-ahead, Escape, aria-live announcements).
 */
const Select = (props: SelectProps) => {
  const t = useTranslations('select')
  const {
    options,
    label,
    error,
    required,
    placeholder,
    name,
    id,
    instanceId,
    disabled,
    isClearable,
    isSearchable,
    wrapperClassName,
    controlClassName,
    controlShouldRenderValue,
    hideSelectedOptions,
    closeMenuOnSelect,
    'aria-label': ariaLabel,
  } = props

  const fieldId = id || name || 'select'
  const errorId = `${fieldId}-error`
  const byValue = (v: string) => options.find(o => o.value === v) ?? null

  const isMulti = props.isMulti === true
  const value: PropsValue<SelectOption> = isMulti
    ? (props.value ?? [])
        .map(byValue)
        .filter((o): o is SelectOption => o != null)
    : byValue(props.value ?? '')

  const handleChange = (newValue: PropsValue<SelectOption>) => {
    if (isMulti) {
      const values = ((newValue as SelectOption[] | null) ?? []).map(
        o => o.value
      )
      ;(props.onChange as ((v: string[]) => void) | undefined)?.(values)
    } else {
      const single = (newValue as SelectOption | null)?.value ?? ''
      ;(props.onChange as ((v: string) => void) | undefined)?.(single)
    }
  }

  const classNames: ClassNamesConfig<SelectOption, boolean> = {
    // `unstyled` strips react-select's relative container, so restore it here
    // (the absolute menu positions against it).
    container: () => 'relative',
    control: ({ isFocused }) =>
      cn(
        'flex w-full cursor-pointer items-center justify-between gap-2 border border-gray-100 bg-gray-50 px-5 py-4 dark:bg-gray-100',
        isFocused && 'border-gray-200 ring-1 ring-black dark:ring-foreground',
        controlClassName
      ),
    valueContainer: () => 'flex flex-wrap items-center gap-1',
    placeholder: () =>
      'font-heading text-body-md text-foreground/70 uppercase tracking-[0.14em]',
    singleValue: () => 'font-heading text-body-md text-foreground',
    input: () => 'text-foreground',
    indicatorsContainer: () => 'flex items-center',
    indicatorSeparator: () => 'hidden',
    dropdownIndicator: () => 'px-1 text-foreground/70',
    clearIndicator: () => 'px-1 text-foreground/70 cursor-pointer',
    menu: () =>
      'absolute z-20 mt-1 w-[min(18rem,calc(100vw-2.5rem))] border border-foreground/10 bg-background',
    menuList: () => 'max-h-72 overflow-auto',
    option: ({ isFocused, isSelected }) =>
      cn(
        'flex cursor-pointer justify-between gap-3 px-4 py-3 font-heading text-body-md uppercase tracking-[0.14em] transition-colors',
        isFocused && 'bg-foreground/5',
        isSelected ? 'text-foreground/70' : 'text-foreground'
      ),
    noOptionsMessage: () =>
      'px-4 py-3 font-heading text-body-md text-foreground/70',
  }

  return (
    <div className={cn('w-full', wrapperClassName)}>
      {label && (
        <label htmlFor={fieldId} className="sr-only">
          {label}
          {required && ' *'}
        </label>
      )}
      <ReactSelect<SelectOption, boolean>
        instanceId={instanceId ?? fieldId}
        inputId={fieldId}
        name={name}
        unstyled
        isMulti={isMulti}
        isDisabled={disabled}
        isClearable={isClearable}
        isSearchable={isSearchable ?? false}
        options={options}
        value={value}
        onChange={handleChange}
        placeholder={placeholder ?? label ?? t('placeholder')}
        controlShouldRenderValue={controlShouldRenderValue}
        hideSelectedOptions={hideSelectedOptions}
        closeMenuOnSelect={closeMenuOnSelect ?? !isMulti}
        aria-label={ariaLabel}
        aria-invalid={error ? true : undefined}
        aria-errormessage={error ? errorId : undefined}
        classNames={classNames}
        formatOptionLabel={(option, { context }) =>
          context === 'menu' && option.count != null ? (
            <>
              <span>{option.label}</span>
              <span>{option.count}</span>
            </>
          ) : (
            option.label
          )
        }
      />
      {error && (
        <p id={errorId} role="alert" className="mt-2 text-sm text-status-error">
          {error}
        </p>
      )}
    </div>
  )
}

Select.displayName = 'Select'

export default Select
export { Select }
