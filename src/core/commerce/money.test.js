import { test } from 'node:test'
import assert from 'node:assert/strict'
import { formatMoney, moneyDescriptor } from './money.js'

test('formatMoney formatea con el símbolo de la moneda', () => {
  const text = formatMoney({ amount: 4500, currency: 'CLP' })
  assert.match(text, /4\.500|4,500/) // separador de miles según entorno ICU
  assert.match(text, /\$/)
})

test('formatMoney con valor nulo devuelve cadena vacía', () => {
  assert.equal(formatMoney(null), '')
  assert.equal(formatMoney(undefined), '')
})

test('moneyDescriptor(true) exige el campo', () => {
  const descriptor = moneyDescriptor(true)
  assert.equal(descriptor.required, true)
  assert.equal(descriptor.fields.currency.pattern.test('CLP'), true)
  assert.equal(descriptor.fields.currency.pattern.test('clp'), false)
})
