import { test } from 'node:test'
import assert from 'node:assert/strict'
import adapter from './adapter.js'

const blueprint = (zones) => ({ delivery: { ownDelivery: { zones } } })
const zone = (overrides) => ({
  id: 'general',
  label: 'Envío a domicilio',
  fee: { amount: 2500, currency: 'CLP' },
  freeOver: { amount: 30000, currency: 'CLP' },
  ...overrides,
})

test('cobra la tarifa normal si el total no alcanza freeOver', async () => {
  const options = await adapter.quote({
    blueprint: blueprint([zone()]),
    cartTotal: { amount: 10000, currency: 'CLP' },
  })
  assert.equal(options[0].fee.amount, 2500)
})

test('la tarifa baja a 0 si el total alcanza o supera freeOver', async () => {
  const options = await adapter.quote({
    blueprint: blueprint([zone()]),
    cartTotal: { amount: 30000, currency: 'CLP' },
  })
  assert.equal(options[0].fee.amount, 0)
})

test('sin freeOver configurado, siempre cobra la tarifa', async () => {
  const options = await adapter.quote({
    blueprint: blueprint([zone({ freeOver: undefined })]),
    cartTotal: { amount: 999999, currency: 'CLP' },
  })
  assert.equal(options[0].fee.amount, 2500)
})
