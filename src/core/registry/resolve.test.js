import { test } from 'node:test'
import assert from 'node:assert/strict'
import { resolveModules } from './resolve.js'

const mod = (id, extra = {}) => ({ id, version: '1.0.0', ...extra })

const catalog = {
  promotions: mod('promotions', { provides: ['discount.rules'] }),
  coupons: mod('coupons', { requires: ['promotions'], provides: ['discount.code-redemption'] }),
  whatsapp: mod('whatsapp', {
    configSchema: {
      phone: { type: 'string', required: true, pattern: /^\+\d{6,}$/ },
      defaultMessage: { type: 'string', default: 'Hola' },
    },
  }),
  reviews: mod('reviews', { conflictsWith: ['whatsapp'] }),
  reporting: mod('reporting', { ports: ['analytics'] }),
  wishlist: mod('wishlist', { optional: ['analytics-module'] }),
}

test('catálogo vacío y sin módulos pedidos: resuelve sin errores', () => {
  const result = resolveModules({}, {})
  assert.equal(result.ok, true)
  assert.deepEqual(result.modules, [])
})

test('detecta un módulo desconocido y sugiere el parecido', () => {
  const result = resolveModules(catalog, { cupones: { enabled: true } })
  assert.equal(result.ok, false)
  assert.match(result.errors[0].message, /Módulo desconocido "cupones"/)
  assert.match(result.errors[0].message, /coupons/)
})

test('rechaza una dependencia dura no satisfecha', () => {
  const result = resolveModules(catalog, {
    coupons: { enabled: true },
    promotions: { enabled: false },
  })
  assert.equal(result.ok, false)
  assert.match(result.errors[0].message, /"coupons" requiere "promotions", que está desactivado/)
})

test('acepta la dependencia satisfecha y ordena topológicamente', () => {
  const result = resolveModules(catalog, {
    coupons: { enabled: true },
    promotions: { enabled: true },
  })
  assert.equal(result.ok, true)
  assert.deepEqual(
    result.modules.map((m) => m.id),
    ['promotions', 'coupons'],
    'una dependencia debe inicializarse antes que quien la necesita'
  )
})

test('rechaza módulos declarados incompatibles', () => {
  const result = resolveModules(catalog, {
    whatsapp: { enabled: true, config: { phone: '+56900000000' } },
    reviews: { enabled: true },
  })
  assert.equal(result.ok, false)
  assert.match(result.errors[0].message, /incompatibles/)
})

test('detecta dependencia circular', () => {
  const cyclic = {
    a: mod('a', { requires: ['b'] }),
    b: mod('b', { requires: ['a'] }),
  }
  const result = resolveModules(cyclic, { a: { enabled: true }, b: { enabled: true } })
  assert.equal(result.ok, false)
  assert.match(result.errors[0].message, /circular/)
})

test('rechaza un módulo cuyo puerto no tiene adaptador', () => {
  const result = resolveModules(catalog, { reporting: { enabled: true } })
  assert.equal(result.ok, false)
  assert.match(result.errors[0].message, /necesita el puerto "analytics"/)
})

test('acepta el módulo si el puerto está disponible', () => {
  const result = resolveModules(
    catalog,
    { reporting: { enabled: true } },
    { availablePorts: ['analytics'] }
  )
  assert.equal(result.ok, true)
})

test('valida la config del módulo contra su configSchema', () => {
  const result = resolveModules(catalog, {
    whatsapp: { enabled: true, config: { phone: 'no-es-un-telefono' } },
  })
  assert.equal(result.ok, false)
  assert.match(result.errors[0].path, /modules\.whatsapp\.config/)
})

test('aplica los defaults del configSchema', () => {
  const result = resolveModules(catalog, {
    whatsapp: { enabled: true, config: { phone: '+56900000000' } },
  })
  assert.equal(result.ok, true)
  assert.equal(result.modules[0].config.defaultMessage, 'Hola')
})

test('una dependencia blanda ausente avisa pero no falla', () => {
  const result = resolveModules(catalog, { wishlist: { enabled: true } })
  assert.equal(result.ok, true)
  assert.match(result.warnings[0].message, /modo degradado/)
})

test('enabled:false excluye el módulo sin error', () => {
  const result = resolveModules(catalog, { promotions: { enabled: false } })
  assert.equal(result.ok, true)
  assert.deepEqual(result.modules, [])
})

test('recopila las capacidades publicadas por los módulos activos', () => {
  const result = resolveModules(catalog, {
    promotions: { enabled: true },
    coupons: { enabled: true },
  })
  assert.deepEqual(result.capabilities.sort(), [
    'discount.code-redemption',
    'discount.rules',
  ])
})

test('el orden no depende del orden de las claves del blueprint', () => {
  const a = resolveModules(catalog, { coupons: {}, promotions: {} })
  const b = resolveModules(catalog, { promotions: {}, coupons: {} })
  assert.deepEqual(
    a.modules.map((m) => m.id),
    b.modules.map((m) => m.id)
  )
})
