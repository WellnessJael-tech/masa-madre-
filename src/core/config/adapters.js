/**
 * Resolución de adaptadores por puerto.
 *
 * MÓDULO PURO. Recibe el catálogo de adaptadores descubiertos y el blueprint,
 * y decide cuál queda detrás de cada puerto.
 *
 * ESTADO: no existe ningún adaptador todavía. Esta pieza es la infraestructura
 * que permitirá enchufarlos sin tocar la UI (DEMO-PRODUCTION.md §2). No se
 * inventa aquí ninguna integración.
 *
 * Nota sobre delivery: el checkout puede ofrecer VARIOS métodos a la vez, así
 * que `delivery` y `payment` admiten una lista de adaptadores, no uno solo
 * (DELIVERY.md §3). Los demás puertos resuelven a uno.
 */

import { PORT_IDS, checkAdapterShape } from '../ports/index.js'

const MULTI_ADAPTER_PORTS = new Set(['payment', 'delivery'])

/**
 * @typedef {Object} AdapterResolution
 * @property {boolean} ok
 * @property {Record<string, object|object[]>} adapters puerto → adaptador(es)
 * @property {string[]} availablePorts  Puertos con al menos un adaptador.
 * @property {Array<{path: string, message: string}>} errors
 * @property {Array<{path: string, message: string}>} warnings
 */

/**
 * @param {Record<string, object>} catalog  "puerto/id" → adaptador
 * @param {object} blueprint                Blueprint validado
 * @returns {AdapterResolution}
 */
export function resolveAdapters(catalog, blueprint) {
  const errors = []
  const warnings = []
  const adapters = {}

  for (const [key, adapter] of Object.entries(catalog)) {
    const problems = checkAdapterShape(adapter)
    for (const problem of problems) {
      errors.push({ path: `adapters.${key}`, message: problem })
    }
  }
  if (errors.length > 0) {
    return { ok: false, adapters: {}, availablePorts: [], errors, warnings }
  }

  const byPort = new Map(PORT_IDS.map((port) => [port, new Map()]))
  for (const adapter of Object.values(catalog)) {
    byPort.get(adapter.port).set(adapter.id, adapter)
  }

  const requested = {
    payment: blueprint.payments?.adapters ?? [],
    delivery: blueprint.delivery?.adapters ?? [],
    analytics: blueprint.analytics?.adapter ? [blueprint.analytics.adapter] : [],
    content: blueprint.content?.adapter ? [blueprint.content.adapter] : [],
  }

  for (const [port, ids] of Object.entries(requested)) {
    const available = byPort.get(port)
    const resolved = []

    for (const id of ids) {
      const adapter = available.get(id)
      if (!adapter) {
        const names = [...available.keys()]
        errors.push({
          path: `${portConfigPath(port)}`,
          message:
            `Adaptador "${id}" no encontrado para el puerto "${port}". ` +
            `Disponibles: ${names.length ? names.join(', ') : '(ninguno)'}.`,
        })
        continue
      }
      resolved.push(adapter)
    }

    if (resolved.length === 0) {
      if (ids.length === 0) {
        warnings.push({
          path: portConfigPath(port),
          message:
            `Ningún adaptador configurado para "${port}". ` +
            `La funcionalidad que dependa de ese puerto quedará inactiva.`,
        })
      }
      continue
    }

    adapters[port] = MULTI_ADAPTER_PORTS.has(port) ? resolved : resolved[0]

    if (!MULTI_ADAPTER_PORTS.has(port) && resolved.length > 1) {
      warnings.push({
        path: portConfigPath(port),
        message: `El puerto "${port}" admite un solo adaptador; se usa "${resolved[0].id}".`,
      })
    }
  }

  const availablePorts = Object.keys(adapters)
  return { ok: errors.length === 0, adapters, availablePorts, errors, warnings }
}

/**
 * Aplana la resolución a "puerto → un adaptador" para el guardarraíl anti-mock,
 * que debe mirar TODOS los adaptadores, también los de los puertos múltiples.
 * @param {Record<string, object|object[]>} adapters
 */
export function flattenAdapters(adapters) {
  const flat = {}
  for (const [port, value] of Object.entries(adapters)) {
    const list = Array.isArray(value) ? value : [value]
    for (const adapter of list) {
      flat[`${port}:${adapter.id}`] = adapter
    }
  }
  return flat
}

function portConfigPath(port) {
  if (port === 'payment') return 'payments.adapters'
  if (port === 'delivery') return 'delivery.adapters'
  if (port === 'analytics') return 'analytics.adapter'
  if (port === 'content') return 'content.adapter'
  return `${port}.adapter`
}
