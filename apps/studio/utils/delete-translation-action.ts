import type { DocumentActionComponent } from 'sanity'
import { useDeleteTranslationAction } from '@sanity/document-internationalization'

// Registers the plugin's action id, as Sanity documents for plugin actions,
// so it can be named in `SINGLETON_ACTIONS` and assigned below.
declare module 'sanity' {
  interface DocumentActionKeys {
    deleteTranslation: never
  }
}

/**
 * The plugin's delete action, typed for `document.actions`.
 *
 * The plugin declares its `action` id as a plain `string`, which Sanity's
 * resolver type rejects. Re-declaring it against the registered key keeps the
 * id the singleton action filter matches on (`deleteTranslation`) without a
 * cast.
 */
export const DeleteTranslationAction: DocumentActionComponent = props =>
  useDeleteTranslationAction(props)

DeleteTranslationAction.action = 'deleteTranslation'
DeleteTranslationAction.displayName = 'DeleteTranslationAction'
