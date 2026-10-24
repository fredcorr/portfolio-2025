import { useCallback, useState } from 'react'
import { CopyIcon } from '@sanity/icons/Copy'
import { LaunchIcon } from '@sanity/icons/Launch'
import { Box, Button, Card, Flex, Stack, Text } from '@sanity/ui'
import { Tooltip } from '@sanity/ui/tooltip'
import type { StringInputProps } from 'sanity'
import { useFormValue } from 'sanity'
import { portableTextToMarkdown } from '@portfolio/utils/portable-text-to-markdown'
import type { PortableTextValue } from '@portfolio/utils/portable-text-to-markdown'

const MEDIUM_EDITOR_URL = 'https://medium.com/new-story'

export function MediumSyndicationInput(props: StringInputProps) {
  const { value, renderDefault } = props
  const [copied, setCopied] = useState(false)

  const articleContent = useFormValue(['articleContent']) as
    | PortableTextValue
    | undefined

  const handleCopy = useCallback(async () => {
    const markdown = portableTextToMarkdown(articleContent)
    await navigator.clipboard.writeText(markdown)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [articleContent])

  return (
    <Stack gap={3}>
      <Flex gap={2}>
        <Tooltip
          content={
            <Box padding={2}>
              <Text size={1}>
                {copied ? 'Copied!' : 'Copy article as Markdown'}
              </Text>
            </Box>
          }
          placement="top"
          portal
        >
          <Button
            icon={CopyIcon}
            text={copied ? 'Copied!' : 'Copy Markdown'}
            tone={copied ? 'positive' : 'default'}
            mode="ghost"
            fontSize={1}
            onClick={handleCopy}
          />
        </Tooltip>
        <Button
          as="a"
          href={MEDIUM_EDITOR_URL}
          target="_blank"
          rel="noreferrer"
          icon={LaunchIcon}
          text="Open Medium editor"
          mode="ghost"
          fontSize={1}
        />
      </Flex>
      {renderDefault(props)}
      {value ? (
        <Card padding={3} radius={2} tone="positive" border>
          <Flex align="center" gap={3} justify="space-between">
            <Box flex={1}>
              <Text size={1} muted>
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
              text="Open on Medium"
              fontSize={1}
            />
          </Flex>
        </Card>
      ) : null}
    </Stack>
  )
}

export default MediumSyndicationInput
