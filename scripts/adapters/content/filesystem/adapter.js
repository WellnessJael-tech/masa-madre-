/**
 * Adaptador de contenido: filesystem.
 *
 * PRIMER ADAPTADOR REAL del sistema. Lee productos y categorías de
 * clients/<slug>/content/. NO es un mock: no simula ninguna integración
 * externa, lee archivos reales del repositorio. `isMock: false` tanto en
 * demo como en producción — el guardarraíl de mocks de
 * docs/business/DEMO-PRODUCTION.md §3 no aplica aquí. Ver ADR-0016.
 *
 * CAPA FINA DE VITE: descubre archivos por glob y delega parseo y validación
 * en core/catalog/parse.js, que es puro.
 */
// Imports relativos, no el alias "@/": este archivo solo lo carga Vite
// (usa import.meta.glob). Ver adapter.meta.js para la metadata Node-safe.
import { parseProduct, parseCategories, crossValidateCatalog } from '../../../core/catalog/parse.js'
import { ConfigError } from '../../../core/config/errors.js'
import meta from './adapter.meta.js'

const PRODUCT_FILES = import.meta.glob('/clients/*/content/products/*.yaml', {
  eager: true,
  query: '?raw',
  import: 'default',
})

const CATEGORY_FILES = import.meta.glob('/clients/*/content/categories.yaml', {
  eager: true,
  query: '?raw',
  import: 'default',
})

/** /clients/<slug>/content/... → <slug> */
function slugOf(path) {
  return path.split('/')[2]
}

function loadCategories(slug) {
  const path = `/clients/${slug}/content/categories.yaml`
  const raw = CATEGORY_FILES[path]
  return raw === undefined ? [] : parseCategories(raw, path)
}

function loadProducts(slug) {
  return Object.entries(PRODUCT_FILES)
    .filter(([path]) => slugOf(path) === slug)
    .map(([path, raw]) => parseProduct(raw, path))
}

/** @param {{slug: string}} ctx */
function listCategories({ slug }) {
  return loadCategories(slug)
}

/** @param {{slug: string}} ctx */
function listProducts({ slug }) {
  const categories = loadCategories(slug)
  const products = loadProducts(slug)

  const crossErrors = crossValidateCatalog(products, categories)
  if (crossErrors.length > 0) {
    throw new ConfigError(`El catálogo de "${slug}" tiene referencias inválidas.`, {
      issues: crossErrors,
    })
  }

  return products
}

export default {
  ...meta,
  listProducts,
  listCategories,
}
