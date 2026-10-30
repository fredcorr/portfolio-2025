import { PageTypeName } from "../base";
import { SanitySlug } from "../sanity";

export interface NavigationItem {
  showInNavigation?: boolean;
  slug: SanitySlug;
  title: string;
  _id: string;
  _type?: PageTypeName;
  /** True for the page hosting the project index, whatever its title or slug. */
  isProjectsIndex?: boolean;
}

export interface NavigationData {
  items: NavigationItem[]
  projectCount?: number
}
