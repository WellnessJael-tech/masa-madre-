/**
 * Parseo + validación de contenido de catálogo (productos y categorías).
 *
 * MÓDULO PURO. La capa fina de Vite que descubre los archivos y llama a
 * estas funciones es adapters/content/filesystem/adapter.js.
 */
import { validate } from '../config/schema/validator.js'
import { ConfigError } from '../config/errors.js'
import { parseYamlOrThrow } from '../lib/yaml.js'
import { productSchema, categoryListSchema } from './schema.js'

/**
 * @param {string} rawYaml  Un archivo, un producto.
 * @param {string} source   Ruta, solo para los mensajes de error.
 */
export function parseProduct(rawYaml, source) {
  const parsed = parseYamlOrThrow(rawYaml, { source, label: `El producto de ${source}` })
  const result = validate(parsed, productSchema)
  if (!result.ok) {
    throw new ConfigError(`Producto inválido en ${source}.`, { source, issues: result.errors })
  }
  return result.value
}

/**
 * @param {string} rawYaml  Un archivo, una LISTA de categorías.
 * @param {string} source
 */
export function parseCategories(rawYaml, source) {
  const parsed = parseYamlOrThrow(rawYaml, { source, label: `Las categorías de ${source}` })
  const result = validate(parsed, categoryListSchema)
  if (!result.ok) {
    throw new ConfigError(`Categorías inválidas en ${source}.`, { source, issues: result.errors })
  }
  return result.value
}

/**
 * Un producto no puede referenciar una categoría que no existe. Mismo
 * espíritu que la comprobación de sucursales de pickup en
 * core/config/blueprint/validate.js.
 * @returns {Array<{path: string, message: string}>}
 */
export function crossValidateCatalog(products, categories) {
  const categoryIds = new Set(categories.map((c) => c.id))
  const errors = []
  for (const product of products) {
    if (!categoryIds.has(product.categoryId)) {
      errors.push({
        path: product.id,
        message:
          `El producto "${product.id}" referencia la categoría "${product.categoryId}", ` +
          `que no existe. Categorías declaradas: ${[...categoryIds].join(', ') || '(ninguna)'}.`,
      })
    }
  }
  return errors
}
