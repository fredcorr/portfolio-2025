'use client'

import { DashboardWidgetContainer } from '@sanity/dashboard'
import { DocumentsIcon } from '@sanity/icons/Documents'
import { Button, Card, Stack, Text } from '@sanity/ui'

const shortcuts = [
  { label: 'Homepage', href: './structure/homepage' },
  { label: 'Pages', href: './structure/pages' },
  { label: 'Settings', href: './structure/settings' },
]

export function StructureMenuWidget() {
  return (
    <DashboardWidgetContainer
      header="Structure"
      footer={
        <Text size={1} muted>
          Use the shortcuts above to jump directly into desk views.
        </Text>
      }
    >
      <Stack gap={3}>
        {shortcuts.map(link => (
          <Card key={link.href} padding={2} radius={2} border>
            <Button
              as="a"
              href={link.href}
              icon={DocumentsIcon}
              justify="flex-start"
              mode="ghost"
              text={link.label}
            />
          </Card>
        ))}
      </Stack>
    </DashboardWidgetContainer>
  )
}
