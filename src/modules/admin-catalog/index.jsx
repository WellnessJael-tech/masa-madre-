import { registerRoute } from '@/core/routes'
import { AdminCatalogPage } from './AdminCatalogPage.jsx'

/**
 * Se ejecuta una sola vez, en el arranque (core/registry/load.js), con la
 * config ya validada contra module.js#configSchema.
 */
export function register(config) {
  registerRoute({
    path: config.basePath,
    moduleId: 'admin-catalog',
    Component: () => <AdminCatalogPage password={config.password} />,
  })
}
