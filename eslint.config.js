import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
  {
    // Node: scripts de tooling, tests y configuración de Playwright.
    // No se ejecutan en el navegador.
    files: [
      'scripts/**/*.{js,mjs}',
      '**/*.test.js',
      'playwright.config.js',
      'e2e/**/*.js',
      'vite-plugins/**/*.js',
    ],
    languageOptions: { globals: globals.node },
  },
  {
    // La versión del core la inyecta Vite (define en vite.config.js).
    files: ['src/**/*.{js,jsx}'],
    languageOptions: { globals: { __CORE_VERSION__: 'readonly' } },
  },
  {
    // VENDOR — componentes generados por `npx shadcn add`. Se actualizan desde upstream,
    // así que se relajan las reglas aquí en vez de editar los archivos (cualquier edición
    // se perdería en la siguiente actualización). Ver DECISIONS.md D-10.
    files: ['src/components/ui/**/*.{js,jsx}'],
    rules: {
      // shadcn hace `import * as React from "react"` aunque el JSX transform no lo requiera.
      'no-unused-vars': ['error', { varsIgnorePattern: '^React$' }],
      // shadcn exporta el componente y sus `cva` variants desde el mismo archivo.
      'react-refresh/only-export-components': 'off',
    },
  },
])
