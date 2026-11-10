/**
 * Convierte texto libre en un slug valido para ids de producto/categoria
 * (core/catalog/schema.js: /^[a-z0-9]+(-[a-z0-9]+)*$/). MODULO PURO.
 *
 * @param {string} text
 * @returns {string}
 */
export function slugify(text) {
  return String(text)
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '') // quita acentos: "cafe" con tilde -> "cafe"
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
