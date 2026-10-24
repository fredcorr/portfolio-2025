import { LaunchIcon } from '@sanity/icons/Launch'
import { Box, Button, Card, Flex, Stack, Text } from '@sanity/ui'
import type { StringInputProps } from 'sanity'

const LABELS: Record<string, string> = {
  mediumPublishedUrl: 'Open on Medium',
  devtoPublishedUrl: 'Open on Dev.to',
}

/**
 * Input for the syndication URL fields. When a URL is present it renders a
 * clickable "Open on …" link directly on the document.
 *
 * - Editable fields (e.g. Medium, pasted in by hand) render the default URL
 *   input above the link preview.
 * - Read-only fields (e.g. Dev.to, set by the "Publish Externally" action)
 *   render only the clickable link, or a muted placeholder when unset.
 */
export function PublishedLinkInput(props: StringInputProps) {
  const { value, schemaType, readOnly, renderDefault } = props
  const label = LABELS[schemaType.name] ?? 'Open published article'

  const link = value ? (
    <Card padding={3} radius={2} tone="positive" border>
      <Flex align="center" gap={3} justify="space-between">
        <Box flex={1}>
          <Text size={1} muted textOverflow="ellipsis">
            {value}
          </Text>
        </Box>
        <Button
          as="a"
          href={value}
          target="_blank"
          rel="noreferrer"
          mode="ghost"
          tone="primary"
          icon={LaunchIcon}
          text={label}
          fontSize={1}
        />
      </Flex>
    </Card>
  ) : null

  if (!readOnly) {
    return (
      <Stack gap={3}>
        {renderDefault(props)}
        {link}
      </Stack>
    )
  }

  return (
    link ?? (
      <Card padding={3} radius={2} tone="transparent" border>
        <Text size={1} muted>
          Not published yet.
        </Text>
      </Card>
    )
  )
}

export default PublishedLinkInput
