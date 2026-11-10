import { test } from 'node:test'
import assert from 'node:assert/strict'
import { isLowStock } from './stockStatus.js'

test('sin stock (0) no es "stock bajo"', () => {
  assert.equal(isLowStock(0, 5), false)
})

test('por debajo o igual al umbral es stock bajo', () => {
  assert.equal(isLowStock(1, 5), true)
  assert.equal(isLowStock(5, 5), true)
})

test('por encima del umbral no es stock bajo', () => {
  assert.equal(isLowStock(6, 5), false)
})
