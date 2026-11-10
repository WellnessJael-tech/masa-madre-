import { test } from 'node:test'
import assert from 'node:assert/strict'
import adapter from './adapter.js'

const blueprint = (branches) => ({
  branches,
  commerce: { currency: 'CLP' },
  delivery: { pickup: { preparationMinutes: 15 } },
})

test('sin sucursales con pickup, no ofrece opciones', async () => {
  const options = await adapter.quote({ blueprint: blueprint([{ id: 'a', name: 'A', pickup: false }]) })
  assert.deepEqual(options, [])
})

test('una sucursal con pickup:true genera una opción gratis', async () => {
  const options = await adapter.quote({
    blueprint: blueprint([{ id: 'centro', name: 'Sucursal Centro', pickup: true }]),
  })
  assert.equal(options.length, 1)
  assert.equal(options[0].fee.amount, 0)
  assert.equal(options[0].etaMinutes, 15)
  assert.match(options[0].label, /Sucursal Centro/)
})

test('isMock es false: no es una simulación', () => {
  assert.equal(adapter.isMock, false)
})
