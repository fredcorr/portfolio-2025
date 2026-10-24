import type { BaseDocument, SanityImage, SanitySlug } from '../sanity'
import { ComponentTypeName, Locale } from '../base'
import type {
  HomePageHeroComponent,
  ProjectListingComponent,
  TestimonialsComponent,
  BlockTextComponent,
  CardsComponent,
  AboutPageHeroComponent,
  CollaborateHighlightsComponent,
  ProcessComponent,
  ImageGalleryComponent,
  StatsComponent,
  FaqsComponent,
  ToolSetComponent,
  FormComponent,
  AnimatedStraplineComponent,
  WorkIndexComponent,
  JournalsFeedComponent,
  JournalsListingComponent,
} from '../components'

export type PageComponent =
  | HomePageHeroComponent
  | ProjectListingComponent
  | TestimonialsComponent
  | BlockTextComponent
  | CardsComponent
  | AboutPageHeroComponent
  | CollaborateHighlightsComponent
  | ProcessComponent
  | ImageGalleryComponent
  | StatsComponent
  | FaqsComponent
  | ToolSetComponent
  | FormComponent
  | AnimatedStraplineComponent
  | WorkIndexComponent
  | JournalsFeedComponent
  | JournalsListingComponent

/**
 * Compile-time guard: every `ComponentTypeName` must be represented in the
 * `PageComponent` union above. If a value is added to the enum without a matching
 * union member, the `Exclude` resolves to that member instead of `never` and this
 * call fails to compile — pointing you at the fix (add the missing component).
 */
const assertNever = <_T extends never>(): void => {
  /* type-level assertion only */
}
assertNever<Exclude<ComponentTypeName, PageComponent['_type']>>()

/**
 * One language version of a page, as listed by its `translation.metadata`
 * document. Only versions that exist and are published are listed — a page is
 * not guaranteed to exist in every locale.
 */
export interface PageTranslation {
  _id: string
  language: Locale
  slug: SanitySlug
}

/**
 * The translation group a page belongs to. `_id` is the metadata document's
 * own id, projected so that linking or unlinking a translation invalidates
 * every page variant that cached this list.
 */
export interface PageTranslations {
  _id: string
  items: PageTranslation[]
}

export interface BasePageDocument extends BaseDocument {
  title?: string
  slug?: SanitySlug
  /** Optional until every existing document has been backfilled with `en`. */
  language?: Locale
  translations?: PageTranslations
  showInNavigation?: boolean
  seoTitle?: string
  seoDescription?: string
  seoImage?: SanityImage
}
