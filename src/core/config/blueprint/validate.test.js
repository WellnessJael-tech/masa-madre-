import { test } from 'node:test'
import assert from 'node:assert/strict'
import { validateBlueprint } from './validate.js'

const CORE = '0.1.0'

/** Blueprint mínimo válido. Cada test parte de aquí y rompe una cosa. */
const base = (overrides = {}) => ({
  schemaVersion: 1,
  blueprintVersion: '0.1.0',
  core: '^0.1',
  slug: 'demo',
  status: 'draft',
  identity: { tradeName: 'Tienda Demo' },
  design: { theme: '_base' },
  commerce: { currency: 'CLP' },
  commercial: { tier: 'managed' },
  ...overrides,
})

const run = (bp, slug = 'demo') => validateBlueprint(bp, { slug, coreVersion: CORE })

test('un blueprint mínimo válido pasa', () => {
  const result = run(base())
  assert.equal(result.ok, true, JSON.stringify(result.errors))
  assert.ok(result.blueprint)
})

test('aplica defaults a los campos ausentes', () => {
  const { blueprint } = run(base())
  assert.equal(blueprint.features.search.enabled, true)
  assert.equal(blueprint.features.checkout.guestCheckout, true)
  assert.equal(blueprint.delivery.quoteTimeoutMs, 5000)
  assert.equal(blueprint.payments.releaseOn, 'paid')
  assert.deepEqual(blueprint.modules, {})
})

test('rechaza un blueprint vacío', () => {
  assert.equal(run(null).ok, false)
  assert.equal(run(undefined).ok, false)
})

test('rechaza una lista de nivel superior', () => {
  const result = run([])
  assert.equal(result.ok, false)
  assert.match(result.errors[0].message, /mapa YAML/)
})

test('exige los campos obligatorios', () => {
  const bp = base()
  delete bp.commerce
  const result = run(bp)
  assert.equal(result.ok, false)
  assert.ok(result.errors.some((e) => e.path === 'commerce'))
})

test('rechaza un tipo equivocado con la ruta exacta', () => {
  const result = run(base({ commerce: { currency: 'CLP' }, branches: 'centro' }))
  assert.equal(result.ok, false)
  assert.ok(result.errors.some((e) => e.path === 'branches' && /lista/.test(e.message)))
})

test('rechaza un valor fuera del enum e indica los válidos', () => {
  const result = run(base({ status: 'publicado' }))
  assert.equal(result.ok, false)
  assert.match(result.errors[0].message, /draft, staging, live, archived/)
})

test('rechaza una moneda con formato inválido', () => {
  const result = run(base({ commerce: { currency: 'peso' } }))
  assert.equal(result.ok, false)
  assert.equal(result.errors[0].path, 'commerce.currency')
})

test('el slug debe coincidir con la carpeta', () => {
  const result = run(base({ slug: 'otro' }), 'demo')
  assert.equal(result.ok, false)
  assert.match(result.errors[0].message, /no coincide con la carpeta/)
})

test('rechaza una versión de esquema que el core no entiende', () => {
  const result = run(base({ schemaVersion: 99 }))
  assert.equal(result.ok, false)
  assert.match(result.errors[0].message, /versión de esquema/)
})

test('rechaza un core incompatible', () => {
  const result = run(base({ core: '^2.0' }))
  assert.equal(result.ok, false)
  assert.match(result.errors[0].message, /no satisface el rango/)
})

test('rechaza una sintaxis de rango no soportada en vez de adivinar', () => {
  const result = run(base({ core: '>=0.1 <1' }))
  assert.equal(result.ok, false)
  assert.match(result.errors[0].message, /Rango no soportado/)
})

test('una clave desconocida avisa pero no rompe, y sugiere', () => {
  const result = run(base({ comerce: {} }))
  assert.equal(result.ok, true)
  const warning = result.warnings.find((w) => w.path === 'comerce')
  assert.ok(warning)
  assert.match(warning.message, /commerce/)
})

test('no se puede publicar con recursos sin aprobar', () => {
  const result = run(base({ status: 'live', assets: { approved: false } }))
  assert.equal(result.ok, false)
  assert.match(result.errors[0].path, /assets.approved/)
})

test('pickup no puede referirse a una sucursal inexistente', () => {
  const result = run(
    base({
      branches: [{ id: 'centro', name: 'Centro', pickup: true }],
      delivery: { pickup: { branches: ['norte'] } },
    })
  )
  assert.equal(result.ok, false)
  assert.match(result.errors[0].message, /Sucursal "norte" no existe/)
})

test('pickup no puede usar una sucursal que no admite retiro', () => {
  const result = run(
    base({
      branches: [{ id: 'centro', name: 'Centro', pickup: false }],
      delivery: { pickup: { branches: ['centro'] } },
    })
  )
  assert.equal(result.ok, false)
  assert.match(result.errors[0].message, /pickup: false/)
})

test('detecta ids de sucursal duplicados', () => {
  const result = run(
    base({
      branches: [
        { id: 'centro', name: 'A' },
        { id: 'centro', name: 'B' },
      ],
    })
  )
  assert.equal(result.ok, false)
  assert.match(result.errors[0].message, /duplicado/)
})

test('avisa si un módulo está activo y a la vez excluido', () => {
  const result = run(
    base({
      modules: { coupons: { enabled: true } },
      excluded: [{ module: 'coupons', reason: 'el cliente no lo quiere' }],
    })
  )
  assert.equal(result.ok, true)
  assert.ok(result.warnings.some((w) => w.path === 'excluded'))
})

test('valida importes anidados de dinero', () => {
  const result = run(
    base({
      delivery: {
        ownDelivery: {
          zones: [{ id: 'z', label: 'Z', fee: { amount: -5, currency: 'CLP' } }],
        },
      },
    })
  )
  assert.equal(result.ok, false)
  assert.match(result.errors[0].path, /fee.amount/)
})
