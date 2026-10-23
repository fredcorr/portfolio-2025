import tsParser from '@typescript-eslint/parser'

// Sanity inlines every SANITY_STUDIO_* variable the Studio code reads into
// the public bundle. A name that looks like a secret must never be read here:
// keep it server-side (web API route or Sanity Function) without the prefix.
//
// ALLOWED lists names that look secret but are knowingly public. Only the
// repo owner adds to it, with the reason next to the name.
const ALLOWED = [
  // Search Console widget. The service account is a Restricted (read-only)
  // Search Console user; exposing it only reveals search analytics, which
  // the owner accepts.
  'GSC_PRIVATE_KEY',
]
const SECRET_NAME = `/^SANITY_STUDIO_(?!(${ALLOWED.join('|')})$)\\w*(KEY|SECRET|TOKEN|PRIVATE|PASSWORD)/`
const message =
  'SANITY_STUDIO_* variables ship in the public Studio bundle. Keep secrets server-side, without the SANITY_STUDIO_ prefix.'

export default [
  { ignores: ['dist/', '.sanity/', 'node_modules/'] },
  {
    files: ['**/*.{ts,tsx,js,jsx,mjs,cjs}'],
    languageOptions: { parser: tsParser },
    rules: {
      'no-restricted-syntax': [
        'error',
        // process.env.NAME / import.meta.env.NAME
        {
          selector: `MemberExpression[object.property.name='env'][property.name=${SECRET_NAME}]`,
          message,
        },
        // process.env['NAME']
        {
          selector: `MemberExpression[object.property.name='env'][property.value=${SECRET_NAME}]`,
          message,
        },
        // const { NAME } = process.env
        {
          selector: `VariableDeclarator[init.property.name='env'] Property[key.name=${SECRET_NAME}]`,
          message,
        },
      ],
    },
  },
]
