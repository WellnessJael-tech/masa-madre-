/**
 * Cliente HTTP del API de solo-desarrollo (vite-plugins/admin-catalog-api.js).
 * No hay lógica aquí más allá de armar la petición — la validación real
 * ocurre en el servidor, contra el mismo esquema que usa content/filesystem.
 */
const BASE = '/__admin-api/products'

async function parseOrThrow(res, fallbackMessage) {
  const data = await res.json().catch(() => null)
  if (!res.ok) throw new Error(data?.error ?? fallbackMessage)
  return data
}

/** @param {string} slug */
export function listProducts(slug) {
  return fetch(`${BASE}?client=${slug}`).then((res) =>
    parseOrThrow(res, 'No se pudo cargar el catálogo.')
  )
}

/** @param {string} slug @param {object} product */
export function createProduct(slug, product) {
  return fetch(`${BASE}?client=${slug}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  }).then((res) => parseOrThrow(res, 'No se pudo crear el producto.'))
}

/** @param {string} slug @param {string} id @param {object} product */
export function updateProduct(slug, id, product) {
  return fetch(`${BASE}/${id}?client=${slug}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  }).then((res) => parseOrThrow(res, 'No se pudo actualizar el producto.'))
}

/** @param {string} slug @param {string} id */
export async function deleteProduct(slug, id) {
  const res = await fetch(`${BASE}/${id}?client=${slug}`, { method: 'DELETE' })
  if (!res.ok) {
    const data = await res.json().catch(() => null)
    throw new Error(data?.error ?? 'No se pudo eliminar el producto.')
  }
}
