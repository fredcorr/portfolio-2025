import { defineBlueprint, defineDocumentFunction } from '@sanity/blueprints'

// No explicit `resource` block: the function runs against its own project's
// datasets by default, which avoids hardcoding a project ID (a mismatch there
// breaks the event rule). Because it is project-wide, the filter must scope
// itself to a single dataset with `sanity::dataset()` — without that, an
// article published in both develop and prod would syndicate to Dev.to twice.
//
// Only English articles syndicate. A translation is a separate document, and
// Dev.to has one post per article — letting an Italian version through would
// publish a duplicate (or, had it inherited `devtoArticleId`, overwrite the
// English post). Articles from before translations existed have no `language`
// and count as English.
export default defineBlueprint({
  resources: [
    defineDocumentFunction({
      name: 'syndicate-devto',
      src: './functions/syndicate-devto',
      event: {
        on: ['create', 'update'],
        filter:
          '_type == "article" && sanity::dataset() == "prod" && coalesce(language, "en") == "en" && (devtoSyndicate == true || defined(devtoArticleId))',
        projection:
          '{_id, title, slug, tags, articleContent, devtoSyndicate, devtoPublishedUrl, devtoArticleId}',
      },
    }),
  ],
})
