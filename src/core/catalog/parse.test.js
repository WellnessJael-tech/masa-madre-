import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseProduct, parseCategories, crossValidateCatalog } from './parse.js'
import { ConfigError } from '../config/errors.js'

test('parsea un producto válido y aplica defaults', () => {
  const yaml = `
id: pan-clasico
name: "Pan clásico"
categoryId: panes
price: { amount: 3500, currency: CLP }
`
  const product = parseProduct(yaml, 'test.yaml')
  assert.equal(product.id, 'pan-clasico')
  assert.equal(product.stock.quantity, 0)
  assert.deepEqual(product.images, [])
})

test('rechaza un producto sin precio', () => {
  assert.throws(
    () => parseProduct('id: pan\nname: Pan\ncategoryId: panes\n', 'test.yaml'),
    ConfigError
  )
})

test('rechaza YAML mal formado', () => {
  assert.throws(
    () => parseProduct('id: pan\n  name: mal indentado', 'test.yaml'),
    ConfigError
  )
})

test('parsea una lista de categorías', () => {
  const categories = parseCategories('- id: panes\n  name: Panes\n', 'c.yaml')
  assert.equal(categories.length, 1)
  assert.equal(categories[0].id, 'panes')
})

test('rechaza categorías que no sean una lista', () => {
  assert.throws(() => parseCategories('id: panes\nname: Panes\n', 'c.yaml'), ConfigError)
})

test('crossValidateCatalog detecta categoría inexistente', () => {
  const errors = crossValidateCatalog([{ id: 'p1', categoryId: 'no-existe' }], [{ id: 'panes' }])
  assert.equal(errors.length, 1)
  assert.match(errors[0].message, /no existe/)
})

test('crossValidateCatalog no reporta nada si todo referencia bien', () => {
  const errors = crossValidateCatalog([{ id: 'p1', categoryId: 'panes' }], [{ id: 'panes' }])
  assert.deepEqual(errors, [])
})
