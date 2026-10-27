import type { AuthorData } from '../settings'

export interface ArticleIntroProps {
  slug?: string
  title?: string
  dateLabel?: string
  /** From the raw CMS date; `dateLabel` is localised and can't be re-parsed. */
  publishedYear?: number
  readTimeLabel?: string
  tags?: string[]
  deck?: string
  editionNumber?: number
  author?: AuthorData
}
