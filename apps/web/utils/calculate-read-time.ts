import type { PortableTextBlock } from '@portabletext/react'

const WORDS_PER_MINUTE = 200

interface ReadTimeResult {
  minutes: number
  words: number
}

type PortableTextChild = PortableTextBlock['children'][number]

const getChildText = (child: PortableTextChild): string => {
  if (
    child &&
    typeof child === 'object' &&
    'text' in child &&
    typeof child.text === 'string'
  ) {
    return child.text
  }

  return ''
}

const extractTextFromBlock = (block: PortableTextBlock): string => {
  const children: PortableTextChild[] = Array.isArray(block.children)
    ? block.children
    : []
  return children.map(getChildText).join(' ')
}

const countWords = (text: string): number => {
  const normalized = text.trim()
  if (!normalized) {
    return 0
  }

  return normalized.split(/\s+/).filter(Boolean).length
}

export const calculateReadTime = (
  content?: PortableTextBlock[] | null,
  wordsPerMinute: number = WORDS_PER_MINUTE
): ReadTimeResult | null => {
  if (!content || content.length === 0) {
    return null
  }

  const text = content.map(extractTextFromBlock).join(' ')
  const words = countWords(text)

  if (!words) {
    return null
  }

  const minutes = Math.max(1, Math.ceil(words / wordsPerMinute))
  return { minutes, words }
}

export default calculateReadTime
