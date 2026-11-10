import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { createRequire } from 'module'
import { adminCatalogApiPlugin } from './vite-plugins/admin-catalog-api.js'

const { version } = createRequire(import.meta.url)('./package.json')

export default defineConfig({
  // adminCatalogApiPlugin: apply:'serve' — nunca se incluye en `vite build`.
  // Ver docs/architecture/DECISIONS.md ADR-0021.
  plugins: [react(), tailwindcss(), adminCatalogApiPlugin()],
  define: {
    // Versión del core, única fuente: package.json. La lee core/config/env.js.
    __CORE_VERSION__: JSON.stringify(version),
  },
  resolve: {
    alias: {
      // import.meta.dirname en vez de __dirname: el cargador de config nativo de Vite
      // no soporta __dirname y pasará a ser el predeterminado. Ver DECISIONS.md D-11.
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
})