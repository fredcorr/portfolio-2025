import { useEffect, useId, useState } from 'react'
import { Button, Flex } from '@sanity/ui'
import { Menu, MenuButton, MenuItem } from '@sanity/ui/menu'
import { CheckmarkIcon } from '@sanity/icons/Checkmark'
import { ChevronDownIcon } from '@sanity/icons/ChevronDown'
import { TranslateIcon } from '@sanity/icons/Translate'
import type { NavbarProps } from 'sanity'
import {
  getStudioLocale,
  setStudioLocale,
  STUDIO_LOCALE_TITLES,
  studioLocale$,
  StudioLocaleFilter,
} from '../structure/studio-locale'

/**
 * Content-language filter for the document lists, built from the same
 * `@sanity/ui` menu primitives as the navbar's own controls so it matches
 * them in both themes.
 */
const StudioLocaleSwitch = () => {
  const [locale, setLocale] = useState(getStudioLocale)
  const menuId = useId()

  useEffect(() => {
    const subscription = studioLocale$.subscribe(setLocale)
    return () => subscription.unsubscribe()
  }, [])

  return (
    <MenuButton
      id={menuId}
      button={
        <Button
          mode="bleed"
          fontSize={1}
          padding={2}
          icon={TranslateIcon}
          iconRight={ChevronDownIcon}
          text={STUDIO_LOCALE_TITLES[locale]}
          aria-label={`Content language: ${STUDIO_LOCALE_TITLES[locale]}`}
        />
      }
      menu={
        <Menu padding={1}>
          {Object.values(StudioLocaleFilter).map(filter => (
            <MenuItem
              key={filter}
              fontSize={1}
              padding={2}
              text={STUDIO_LOCALE_TITLES[filter]}
              iconRight={filter === locale ? CheckmarkIcon : undefined}
              pressed={filter === locale}
              onClick={() => setStudioLocale(filter)}
            />
          ))}
        </Menu>
      }
      popover={{ placement: 'bottom-end', portal: true }}
    />
  )
}

/**
 * Studio navbar with the content-language switch beside the default bar.
 * Registered only on workspaces with translations enabled.
 */
export const NavbarWithLocaleSwitch = (props: NavbarProps) => (
  <Flex align="center">
    <div style={{ flex: 1, minWidth: 0 }}>{props.renderDefault(props)}</div>
    <Flex paddingX={2}>
      <StudioLocaleSwitch />
    </Flex>
  </Flex>
)
