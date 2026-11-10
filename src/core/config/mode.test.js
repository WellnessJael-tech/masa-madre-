import { test } from 'node:test'
import assert from 'node:assert/strict'
import { resolveMode, checkNoMocksInProduction, MODES } from './mode.js'

const blueprint = (extra = {}) => ({
  status: 'live',
  assets: { approved: true },
  seo: {},
  ...extra,
})

test('sin VITE_MODE se asume demo, que es el default seguro', () => {
  const result = resolveMode({ rawMode: undefined })
  assert.equal(result.mode, MODES.DEMO)
  assert.equal(result.isDemo, true)
  assert.match(result.warnings[0].message, /default seguro/)
})

test('cadena vacía también cae en demo', () => {
  assert.equal(resolveMode({ rawMode: '' }).mode, MODES.DEMO)
})

test('un valor no reconocido es error, no un default silencioso', () => {
  const result = resolveMode({ rawMode: 'produccion' })
  assert.equal(result.errors.length, 1)
  assert.match(result.errors[0].message, /no reconocido/)
})

test('demo activa el marcado visual y permite mocks', () => {
  const result = resolveMode({ rawMode: 'demo', blueprint: blueprint() })
  assert.equal(result.showDemoBadge, true)
  assert.equal(result.allowMockAdapters, true)
})

test('producción no marca demo y no permite mocks', () => {
  const result = resolveMode({ rawMode: 'production', blueprint: blueprint() })
  assert.equal(result.showDemoBadge, false)
  assert.equal(result.allowMockAdapters, false)
  assert.equal(result.isProduction, true)
})

test('producción con recursos sin aprobar es error', () => {
  const result = resolveMode({
    rawMode: 'production',
    blueprint: blueprint({ assets: { approved: false } }),
  })
  assert.equal(result.errors.length, 1)
  assert.match(result.errors[0].path, /assets.approved/)
})

test('producción con status distinto de live fuerza robots disallow', () => {
  const result = resolveMode({
    rawMode: 'production',
    blueprint: blueprint({ status: 'staging' }),
  })
  assert.equal(result.robots, 'disallow')
  assert.match(result.warnings[0].message, /no indexar/)
})

test('solo un cliente live en producción permite indexar', () => {
  assert.equal(resolveMode({ rawMode: 'production', blueprint: blueprint() }).robots, 'allow')
  assert.equal(resolveMode({ rawMode: 'demo', blueprint: blueprint() }).robots, 'disallow')
})

test('EL GUARDARRAÍL: un mock en producción es error', () => {
  const issues = checkNoMocksInProduction('production', {
    'payment:mock': { id: 'payment-mock', isMock: true },
    'delivery:own': { id: 'own-delivery', isMock: false },
  })
  assert.equal(issues.length, 1)
  assert.match(issues[0].message, /simulado/)
  assert.match(issues[0].path, /payment/)
})

test('en demo los mocks se permiten', () => {
  const issues = checkNoMocksInProduction('demo', {
    'payment:mock': { id: 'payment-mock', isMock: true },
  })
  assert.deepEqual(issues, [])
})

test('producción sin mocks pasa el guardarraíl', () => {
  const issues = checkNoMocksInProduction('production', {
    'delivery:own': { id: 'own-delivery', isMock: false },
  })
  assert.deepEqual(issues, [])
})
