import { test } from 'node:test'
import assert from 'node:assert/strict'
import { satisfies, parseVersion } from './semver.js'

test('parsea versiones con y sin patch', () => {
  assert.deepEqual(parseVersion('1.4.2'), { major: 1, minor: 4, patch: 2 })
  assert.deepEqual(parseVersion('1.4'), { major: 1, minor: 4, patch: 0 })
  assert.equal(parseVersion('no'), null)
})

test('caret con major >= 1 admite minor y patch', () => {
  assert.equal(satisfies('1.4.0', '^1.4').ok, true)
  assert.equal(satisfies('1.9.3', '^1.4').ok, true)
  assert.equal(satisfies('2.0.0', '^1.4').ok, false)
  assert.equal(satisfies('1.3.9', '^1.4').ok, false)
})

test('caret con major 0 pinta el minor: 0.x es inestable', () => {
  assert.equal(satisfies('0.1.0', '^0.1').ok, true)
  assert.equal(satisfies('0.1.9', '^0.1').ok, true)
  assert.equal(satisfies('0.2.0', '^0.1').ok, false)
})

test('tilde admite solo patches', () => {
  assert.equal(satisfies('1.4.7', '~1.4').ok, true)
  assert.equal(satisfies('1.5.0', '~1.4').ok, false)
})

test('rango exacto exige coincidencia total', () => {
  assert.equal(satisfies('1.4.2', '1.4.2').ok, true)
  assert.equal(satisfies('1.4.3', '1.4.2').ok, false)
})

test('rango exacto sin patch se rechaza en vez de adivinar', () => {
  const result = satisfies('1.4.0', '1.4')
  assert.equal(result.ok, false)
  assert.match(result.reason, /incompleto/)
})

test('una sintaxis no soportada se rechaza con explicación', () => {
  for (const range of ['>=1.0', '1.x', '*', 'latest', '1.0.0 - 2.0.0']) {
    const result = satisfies('1.0.0', range)
    assert.equal(result.ok, false, `"${range}" debería rechazarse`)
    assert.match(result.reason, /no soportado|incompleto/)
  }
})

test('una versión inválida se rechaza', () => {
  assert.equal(satisfies('vNext', '^1.0').ok, false)
})
