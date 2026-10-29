import { ComponentTypeName } from "../base";
import type { ProjectPageDocument } from "../pages";
import type { PortableTextBlock } from "@portabletext/types";
import type { SanityComponentBase } from "./base-component";
import type { ComponentHeading } from "./title";

export interface ProjectListingProject extends Pick<
  ProjectPageDocument,
  | "_id"
  | "_type"
  | "title"
  | "slug"
  | "projectHero"
  | "seoImage"
  | "seoDescription"
  | "clientName"
  | "projectTags"
> {}

export interface ProjectListingComponent extends SanityComponentBase<ComponentTypeName.ProjectListing> {
  title?: ComponentHeading;
  subtitle?: PortableTextBlock[];
  projects?: ProjectListingProject[];
  addStaggerAnimation?: boolean;
  showCtaToProjects?: boolean;
  /** Slug of the projects index page in this locale; null when there is none. */
  projectsIndexSlug?: string | null;
}
