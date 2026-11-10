import { test } from 'node:test'
import assert from 'node:assert/strict'
import { slugify } from './slugify.js'

test('convierte espacios en guiones y pasa a minúsculas', () => {
  assert.equal(slugify('Pan Integral'), 'pan-integral')
})

test('quita acentos', () => {
  assert.equal(slugify('Café con Panecillo'), 'cafe-con-panecillo')
})

test('colapsa símbolos y espacios múltiples en un solo guion', () => {
  assert.equal(slugify('Pan  (500g) — Clásico!!'), 'pan-500g-clasico')
})

test('quita guiones al inicio y al final', () => {
  assert.equal(slugify('  --Vitamina C--  '), 'vitamina-c')
})

test('produce un resultado válido contra el patrón de productSchema', () => {
  const pattern = /^[a-z0-9]+(-[a-z0-9]+)*$/
  for (const input of ['Mascarillas Quirúrgicas (caja x50)', 'Ñoquis de la Nonna', '  ']) {
    const slug = slugify(input)
    if (slug !== '') assert.match(slug, pattern, `"${input}" -> "${slug}"`)
  }
})
