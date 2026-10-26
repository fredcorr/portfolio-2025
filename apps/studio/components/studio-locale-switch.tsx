import { useEffect, useId, useState } from 'react'
import { Button, Card, Flex } from '@sanity/ui'
import { Menu, MenuButton, MenuItem } from '@sanity/ui/menu'
import { CheckmarkIcon } from '@sanity/icons/Checkmark'
import { ChevronDownIcon } from '@sanity/icons/ChevronDown'
import { TranslateIcon } from '@sanity/icons/Translate'
import { getReleaseTone, usePerspective, type NavbarProps } from 'sanity'
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
 *
 * The switch sits outside the default navbar's own card, so it gets a card of
 * its own that copies that one's surface: same tone (which follows the
 * selected release, as the navbar's does), same bottom border, stretched to
 * the bar's height. Without it the switch shows the layout background.
 */
export const NavbarWithLocaleSwitch = (props: NavbarProps) => {
  const { selectedPerspective } = usePerspective()

  return (
    <Flex align="stretch">
      <div style={{ flex: 1, minWidth: 0 }}>{props.renderDefault(props)}</div>
      <Card
        tone={getReleaseTone(selectedPerspective)}
        borderBottom
        paddingX={2}
        display="flex"
        style={{ alignItems: 'center' }}
      >
        <StudioLocaleSwitch />
      </Card>
    </Flex>
  )
}
