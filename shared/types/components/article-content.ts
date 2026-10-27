import type { PortableTextBlock } from '@portabletext/types'
import type { AuthorData } from '../settings'

export interface ArticleContentProps {
  content?: PortableTextBlock[]
  shareUrl?: string
  shareTitle?: string
  tags?: string[]
  author?: AuthorData
  dateLabel?: string
  /** From the raw CMS date; `dateLabel` is localised and can't be re-parsed. */
  publishedYear?: number
  readTimeLabel?: string
  editionNumber?: number
  showReaderCount?: boolean
  prevUrl?: string
  nextUrl?: string
}
