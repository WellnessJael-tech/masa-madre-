/**
 * Punto de acceso del catálogo para la UI.
 *
 * Los datos son estáticos (import.meta.glob eager) y se cachean al primer
 * acceso, igual que core/config/runtime.js cachea el resultado de boot().
 * Cuando exista un adaptador remoto (CMS) esto puede necesitar volverse
 * asíncrono — no antes.
 */
import { getRuntime } from '../config/runtime.js'

/** @type {{products: object[], categories: object[]} | null} */
let cached = null

/** @returns {{products: object[], categories: object[]}} */
export function getCatalog() {
  if (cached) return cached

  const runtime = getRuntime()
  if (!runtime.ok) return (cached = { products: [], categories: [] })

  const contentAdapter = runtime.value.adapters.content
  if (!contentAdapter) return (cached = { products: [], categories: [] })

  const slug = runtime.value.manifest.client
  cached = {
    products: contentAdapter.listProducts({ slug }),
    categories: contentAdapter.listCategories({ slug }),
  }
  return cached
}

/** Solo para tests. */
export function resetCatalogCache() {
  cached = null
}
