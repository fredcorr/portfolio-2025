import { useEffect, useId, useState, type ChangeEvent } from 'react'
import { Flex, Select, Text } from '@sanity/ui'
import type { NavbarProps } from 'sanity'
import {
  getStudioLocale,
  setStudioLocale,
  STUDIO_LOCALE_TITLES,
  studioLocale$,
  StudioLocaleFilter,
} from '../structure/studio-locale'

const isFilter = (value: string): value is StudioLocaleFilter =>
  Object.values(StudioLocaleFilter).some(filter => filter === value)

const StudioLocaleSwitch = () => {
  const [locale, setLocale] = useState(getStudioLocale)
  const selectId = useId()

  useEffect(() => {
    const subscription = studioLocale$.subscribe(setLocale)
    return () => subscription.unsubscribe()
  }, [])

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const { value } = event.currentTarget

    if (isFilter(value)) {
      setStudioLocale(value)
    }
  }

  return (
    <Flex align="center" gap={2} paddingX={2}>
      <Text as="label" htmlFor={selectId} size={1} muted>
        Content language
      </Text>
      <Select
        id={selectId}
        fontSize={1}
        padding={2}
        value={locale}
        onChange={handleChange}
      >
        {Object.values(StudioLocaleFilter).map(filter => (
          <option key={filter} value={filter}>
            {STUDIO_LOCALE_TITLES[filter]}
          </option>
        ))}
      </Select>
    </Flex>
  )
}

/**
 * Studio navbar with the content-language switch beside the default bar.
 * Registered only on workspaces with translations enabled.
 */
export const NavbarWithLocaleSwitch = (props: NavbarProps) => (
  <Flex align="center">
    <div style={{ flex: 1, minWidth: 0 }}>{props.renderDefault(props)}</div>
    <StudioLocaleSwitch />
  </Flex>
)
